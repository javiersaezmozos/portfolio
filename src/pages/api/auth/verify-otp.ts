import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/env';
import { createSessionToken, SESSION_COOKIE_NAME, sha256Hex } from '../../../lib/crypto';
import { checkRateLimit, getSql, isEmailApproved, verifyAndConsumeOtp } from '../../../lib/db';

export const prerender = false;

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export const POST: APIRoute = async ({ request, locals, cookies, url }) => {
  try {
    const env = getRuntimeEnv(locals);
    if (!env.DATABASE_URL || !env.SESSION_SECRET) {
      return json(500, { ok: false, error: 'Server configuration error' });
    }

    const body = (await request.json().catch(() => null)) as { email?: string; otp?: string } | null;
    const email = String(body?.email || '').trim().toLowerCase();
    const otp = String(body?.otp || '').replace(/\D/g, '');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || otp.length !== 6) {
      return json(400, { ok: false, error: 'Invalid email or 6-digit code' });
    }

    const sql = getSql(env.DATABASE_URL);
    const clientIp =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown';

    const allowed = await checkRateLimit(sql, `otp-verify:${clientIp}:${email}`, 12, 24);
    if (!allowed) {
      return json(429, { ok: false, error: 'Too many verification attempts' });
    }

    const approved = await isEmailApproved(sql, email);
    if (!approved) {
      return json(403, { ok: false, error: 'Account not approved' });
    }

    const codeHash = await sha256Hex(`${email}:${otp}`);
    const ok = await verifyAndConsumeOtp(sql, email, codeHash);
    if (!ok) {
      return json(401, { ok: false, error: 'Invalid or expired code' });
    }

    const sessionToken = await createSessionToken(env.SESSION_SECRET, email);
    cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: url.protocol === 'https:',
      maxAge: 60 * 60 * 24 * 365,
    });

    return json(200, { ok: true });
  } catch (err) {
    console.error('[api/auth/verify-otp] Error:', err);
    return json(500, { ok: false, error: 'Internal server error' });
  }
};
