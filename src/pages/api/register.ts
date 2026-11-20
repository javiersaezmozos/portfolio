import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../lib/env';
import {
  createApprovalSignature,
  createSessionToken,
  normalizeOrderKey,
  SESSION_COOKIE_NAME,
  sha256Hex,
} from '../../lib/crypto';
import { checkRateLimit, findDuplicate, getSql, insertRegistration } from '../../lib/db';
import { validateReceiptWithGemini } from '../../lib/gemini';
import {
  sendAdminReviewEmail,
  sendBuyerApprovalEmail,
  type SupportedLang,
} from '../../lib/brevo';

export const prerender = false;

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED_LANGS = new Set<SupportedLang>(['es', 'en', 'de', 'it']);

function json(status: number, body: Record<string, unknown>, extraHeaders?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders },
  });
}

export const POST: APIRoute = async ({ request, locals, cookies, url }) => {
  try {
    const env = getRuntimeEnv(locals);
    if (!env.DATABASE_URL || !env.SESSION_SECRET || !env.APPROVAL_SECRET) {
      console.error('[api/register] Faltan secretos críticos en el entorno.');
      return json(500, { ok: false, error: 'Server configuration error' });
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return json(400, { ok: false, error: 'Expected multipart/form-data' });
    }

    const form = await request.formData();

    // Honeypot anti-bots
    const website = String(form.get('website') || '').trim();
    if (website.length > 0) {
      return json(200, { ok: true, verdict: 'DUDOSO' });
    }

    const name = String(form.get('name') || '').trim().slice(0, 120);
    const email = String(form.get('email') || '').trim().toLowerCase().slice(0, 180);
    const channel = String(form.get('channel') || 'amazon-kdp').trim().slice(0, 40);
    const orderId = String(form.get('orderId') || '').trim().slice(0, 80);
    const notes = String(form.get('notes') || '').trim().slice(0, 500);
    const rawLang = String(form.get('lang') || 'es').trim().toLowerCase() as SupportedLang;
    const lang: SupportedLang = ALLOWED_LANGS.has(rawLang) ? rawLang : 'es';

    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(400, { ok: false, error: 'Invalid name or email' });
    }

    const orderKey = normalizeOrderKey(orderId);
    if (orderKey.length < 6) {
      return json(400, { ok: false, error: 'Invalid orderId' });
    }

    const receiptEntry = form.get('receipt');
    if (!(receiptEntry instanceof File) || receiptEntry.size === 0) {
      return json(400, { ok: false, error: 'Missing receipt image' });
    }
    if (receiptEntry.size > MAX_IMAGE_BYTES) {
      return json(413, { ok: false, error: 'Receipt image too large (max 4 MB)' });
    }

    const mimeType = receiptEntry.type && receiptEntry.type.startsWith('image/')
      ? receiptEntry.type
      : 'image/jpeg';

    const imageBytes = new Uint8Array(await receiptEntry.arrayBuffer());
    const imageHash = await sha256Hex(imageBytes);

    const sql = getSql(env.DATABASE_URL);
    const clientIp =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown';

    const [ipAllowed, emailAllowed] = await Promise.all([
      checkRateLimit(sql, `reg:ip:${clientIp}`, 10, 24),
      checkRateLimit(sql, `reg:email:${email}`, 4, 24),
    ]);
    if (!ipAllowed || !emailAllowed) {
      return json(429, { ok: false, error: 'Too many attempts. Try again later.' });
    }

    const dup = await findDuplicate(sql, orderKey, imageHash);
    if (dup) {
      return json(200, { ok: true, verdict: 'DUPLICADO', duplicateType: dup });
    }

    const ai = await validateReceiptWithGemini({
      primaryKey: env.GEMINI_API_KEY,
      paidKey: env.GEMINI_API_KEY_PAID,
      imageBytes,
      mimeType,
      orderId,
      channel,
      buyerName: name,
    });

    // Cualquier caso no claramente aprobado pasa a revisión manual para evitar falsos negativos.
    const status = ai.verdict === 'APROBADO' ? 'approved' : 'pending';

    const row = await insertRegistration(sql, {
      name,
      email,
      channel,
      orderId,
      orderKey,
      imageHash,
      lang,
      notes,
      status,
      aiVerdict: ai.verdict,
      aiReason: ai.reason,
    });

    const brevoCfg = {
      apiKey: env.BREVO_API_KEY,
      senderEmail: env.BREVO_SENDER_EMAIL,
      senderName: env.BREVO_SENDER_NAME,
      replyTo: env.ADMIN_REVIEW_EMAIL,
    };

    if (status === 'approved') {
      const sessionToken = await createSessionToken(env.SESSION_SECRET, email);
      cookies.set(SESSION_COOKIE_NAME, sessionToken, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: url.protocol === 'https:',
        maxAge: 60 * 60 * 24 * 365,
      });

      try {
        await sendBuyerApprovalEmail(brevoCfg, { to: email, name, lang, orderId });
      } catch (mailErr) {
        console.error('[api/register] Error enviando confirmación al alumno:', mailErr);
      }

      return json(200, { ok: true, verdict: 'APROBADO' });
    }

    // Caso pendiente/dudoso: avisar al administrador con adjunto + enlace HMAC seguro.
    try {
      const { exp, sig } = await createApprovalSignature(env.APPROVAL_SECRET, row.id);
      const origin = `${url.protocol}//${url.host}`;
      const reviewUrl = `${origin}/admin/revisar?id=${row.id}&exp=${exp}&sig=${encodeURIComponent(sig)}`;

      await sendAdminReviewEmail(brevoCfg, {
        adminEmail: env.ADMIN_REVIEW_EMAIL,
        registrationId: row.id,
        buyerName: name,
        buyerEmail: email,
        orderId,
        channel,
        lang,
        aiReason: `${ai.verdict}: ${ai.reason}`,
        notes,
        reviewUrl,
        attachmentBytes: imageBytes,
        attachmentName: receiptEntry.name || `recibo-${row.id}.jpg`,
      });
    } catch (adminErr) {
      console.error('[api/register] Error enviando aviso de revisión al admin:', adminErr);
    }

    return json(200, { ok: true, verdict: 'DUDOSO' });
  } catch (err) {
    console.error('[api/register] Excepción inesperada:', err);
    return json(500, { ok: false, error: 'Internal server error' });
  }
};
