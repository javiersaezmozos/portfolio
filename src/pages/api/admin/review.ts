import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/env';
import { verifyApprovalSignature } from '../../../lib/crypto';
import { getRegistrationById, getSql, updateRegistrationStatus } from '../../../lib/db';
import { sendBuyerApprovalEmail, type SupportedLang } from '../../../lib/brevo';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  try {
    const env = getRuntimeEnv(locals);
    if (!env.DATABASE_URL || !env.APPROVAL_SECRET) {
      return new Response('Server configuration error', { status: 500 });
    }

    const form = await request.formData();
    const id = Number(form.get('id'));
    const exp = Number(form.get('exp'));
    const sig = String(form.get('sig') || '');
    const action = String(form.get('action') || '');

    const valid = await verifyApprovalSignature(env.APPROVAL_SECRET, id, exp, sig);
    if (!valid || (action !== 'approve' && action !== 'reject')) {
      return new Response('Enlace inválido o caducado', { status: 403 });
    }

    const sql = getSql(env.DATABASE_URL);
    const existing = await getRegistrationById(sql, id);
    if (!existing) {
      return new Response('Registro no encontrado', { status: 404 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const updated = await updateRegistrationStatus(sql, id, newStatus);

    if (newStatus === 'approved' && updated && existing.status !== 'approved') {
      try {
        const lang = (['es', 'en', 'de', 'it'].includes(updated.lang)
          ? updated.lang
          : 'es') as SupportedLang;
        await sendBuyerApprovalEmail(
          {
            apiKey: env.BREVO_API_KEY,
            senderEmail: env.BREVO_SENDER_EMAIL,
            senderName: env.BREVO_SENDER_NAME,
            replyTo: env.ADMIN_REVIEW_EMAIL,
          },
          {
            to: updated.email,
            name: updated.name,
            lang,
            orderId: updated.order_id,
          }
        );
      } catch (mailErr) {
        console.error('[api/admin/review] Error enviando confirmación tras aprobar:', mailErr);
      }
    }

    const target = `/admin/revisar?id=${id}&exp=${exp}&sig=${encodeURIComponent(sig)}&done=${newStatus}`;
    return redirect(target, 303);
  } catch (err) {
    console.error('[api/admin/review] Error:', err);
    return new Response('Error interno', { status: 500 });
  }
};
