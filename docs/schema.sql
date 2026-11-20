-- Esquema Neon Postgres para Registro de Ejemplares y Acceso QR (/e/[codigo])
-- Ejecutar una única vez en Neon SQL Editor.

CREATE TABLE IF NOT EXISTS registrations (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'amazon-kdp',
  order_id TEXT NOT NULL,
  order_key TEXT NOT NULL UNIQUE,
  image_hash TEXT NOT NULL UNIQUE,
  lang TEXT NOT NULL DEFAULT 'es',
  notes TEXT DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('approved', 'pending', 'rejected')),
  ai_verdict TEXT NOT NULL DEFAULT 'DUDOSO',
  ai_reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_registrations_email_status
  ON registrations (LOWER(email), status);

CREATE TABLE IF NOT EXISTS otp_codes (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_email_created
  ON otp_codes (LOWER(email), created_at DESC);

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
