import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/env';
import { generateOtp6, sha256Hex } from '../../../lib/crypto';
import { checkRateLimit, getSql, isEmailApproved, storeOtpCode } from '../../../lib/db';
import { sendOtpEmail, type SupportedLang } from '../../../lib/brevo';

export const prerender = false;

const ALLOWED_LANGS = new Set<SupportedLang>(['es', 'en', 'de', 'it']);

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = getRuntimeEnv(locals);
    if (!env.DATABASE_URL || !env.BREVO_API_KEY) {
      return json(500, { ok: false, error: 'Server configuration error' });
    }

    const body = (await request.json().catch(() => null)) as { email?: string; lang?: string } | null;
    const email = String(body?.email || '').trim().toLowerCase();
    const rawLang = String(body?.lang || 'es').trim().toLowerCase() as SupportedLang;
    const lang: SupportedLang = ALLOWED_LANGS.has(rawLang) ? rawLang : 'es';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(400, { ok: false, error: 'Invalid email' });
    }

    const sql = getSql(env.DATABASE_URL);
    const clientIp =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown';

    const [ipOk, emailOk] = await Promise.all([
      checkRateLimit(sql, `otp:ip:${clientIp}`, 15, 24),
      checkRateLimit(sql, `otp:email:${email}`, 5, 24),
    ]);
    if (!ipOk || !emailOk) {
      return json(429, { ok: false, error: 'Too many OTP requests' });
    }

    const approved = await isEmailApproved(sql, email);
    if (!approved) {
      const pendingRows = (await sql`
        SELECT status FROM registrations
        WHERE LOWER(email) = ${email}
        ORDER BY created_at DESC
        LIMIT 1
      `) as Array<{ status: string }>;

      const currentStatus = pendingRows[0]?.status === 'pending' ? 'pending' : 'not_found';
      return json(403, { ok: false, status: currentStatus });
    }

    const otp = generateOtp6();
    const codeHash = await sha256Hex(`${email}:${otp}`);
    await storeOtpCode(sql, email, codeHash);

    await sendOtpEmail(
      {
        apiKey: env.BREVO_API_KEY,
        senderEmail: env.BREVO_SENDER_EMAIL,
        senderName: env.BREVO_SENDER_NAME,
        replyTo: env.ADMIN_REVIEW_EMAIL,
      },
      { to: email, otp, lang }
    );

    return json(200, { ok: true });
  } catch (err) {
    console.error('[api/auth/request-otp] Error:', err);
    return json(500, { ok: false, error: 'Internal server error' });
  }
};
