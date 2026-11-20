import type { Env } from '../env';

/**
 * Resuelve variables de entorno de forma segura tanto en Cloudflare Pages
 * (`locals.runtime.env`) como en desarrollo local (`import.meta.env` / `process.env`).
 */
export function getRuntimeEnv(locals?: App.Locals): Required<Env> {
  const cfEnv = locals?.runtime?.env;
  const metaEnv = import.meta.env as Record<string, string | undefined>;
  const procEnv = typeof process !== 'undefined' ? process.env : {};

  const pick = (key: keyof Env, fallback = ''): string =>
    (cfEnv?.[key] || metaEnv[key] || procEnv[key] || fallback).trim();

  return {
    DATABASE_URL: pick('DATABASE_URL'),
    SESSION_SECRET: pick('SESSION_SECRET'),
    APPROVAL_SECRET: pick('APPROVAL_SECRET'),
    BREVO_API_KEY: pick('BREVO_API_KEY'),
    BREVO_SENDER_EMAIL: pick('BREVO_SENDER_EMAIL', 'registro@javisaez.com'),
    BREVO_SENDER_NAME: pick('BREVO_SENDER_NAME', 'Javier Sáez'),
    ADMIN_REVIEW_EMAIL: pick('ADMIN_REVIEW_EMAIL', 'orders@javisaez.com'),
    GEMINI_API_KEY: pick('GEMINI_API_KEY'),
    GEMINI_API_KEY_PAID: pick('GEMINI_API_KEY_PAID'),
  };
}
