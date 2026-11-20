/// <reference path="../.astro/types.d.ts" />

export interface Env {
  DATABASE_URL?: string;
  SESSION_SECRET?: string;
  APPROVAL_SECRET?: string;
  BREVO_API_KEY?: string;
  BREVO_SENDER_EMAIL?: string;
  BREVO_SENDER_NAME?: string;
  ADMIN_REVIEW_EMAIL?: string;
  GEMINI_API_KEY?: string;
  GEMINI_API_KEY_PAID?: string;
}

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
