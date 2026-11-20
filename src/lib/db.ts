import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

export type SqlClient = NeonQueryFunction<false, false>;

export interface RegistrationRow {
  id: number;
  name: string;
  email: string;
  channel: string;
  order_id: string;
  order_key: string;
  image_hash: string;
  lang: string;
  notes: string;
  status: 'approved' | 'pending' | 'rejected';
  ai_verdict: string;
  ai_reason: string;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
}

/** Obtiene una instancia del cliente serverless de Neon Postgres. */
export function getSql(databaseUrl: string): SqlClient {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL no configurada');
  }
  return neon(databaseUrl);
}

/** Comprueba si existe un pedido normalizado o huella de imagen duplicada. */
export async function findDuplicate(
  sql: SqlClient,
  orderKey: string,
  imageHash: string
): Promise<'order' | 'image' | null> {
  const rows = (await sql`
    SELECT order_key, image_hash
    FROM registrations
    WHERE order_key = ${orderKey} OR image_hash = ${imageHash}
    LIMIT 1
  `) as Array<{ order_key: string; image_hash: string }>;

  if (!rows.length) return null;
  return rows[0].order_key === orderKey ? 'order' : 'image';
}

/** Aplica control de tasa de 24 horas por clave (ej. `reg:ip` o `otp:email`). */
export async function checkRateLimit(
  sql: SqlClient,
  key: string,
  maxPerWindow: number,
  windowHours = 24
): Promise<boolean> {
  const rows = (await sql`
    INSERT INTO rate_limits (key, count, window_start)
    VALUES (${key}, 1, NOW())
    ON CONFLICT (key) DO UPDATE SET
      count = CASE
        WHEN rate_limits.window_start < NOW() - (${windowHours} * INTERVAL '1 hour') THEN 1
        ELSE rate_limits.count + 1
      END,
      window_start = CASE
        WHEN rate_limits.window_start < NOW() - (${windowHours} * INTERVAL '1 hour') THEN NOW()
        ELSE rate_limits.window_start
      END
    RETURNING count
  `) as Array<{ count: number }>;

  return (rows[0]?.count ?? 1) <= maxPerWindow;
}

/** Inserta un nuevo registro de ejemplar y devuelve la fila creada. */
export async function insertRegistration(
  sql: SqlClient,
  data: {
    name: string;
    email: string;
    channel: string;
    orderId: string;
    orderKey: string;
    imageHash: string;
    lang: string;
    notes: string;
    status: 'approved' | 'pending' | 'rejected';
    aiVerdict: string;
    aiReason: string;
  }
): Promise<RegistrationRow> {
  const normalizedEmail = data.email.trim().toLowerCase();
  const rows = (await sql`
    INSERT INTO registrations (
      name, email, channel, order_id, order_key, image_hash,
      lang, notes, status, ai_verdict, ai_reason, approved_at
    )
    VALUES (
      ${data.name},
      ${normalizedEmail},
      ${data.channel},
      ${data.orderId},
      ${data.orderKey},
      ${data.imageHash},
      ${data.lang},
      ${data.notes},
      ${data.status},
      ${data.aiVerdict},
      ${data.aiReason},
      ${data.status === 'approved' ? new Date().toISOString() : null}
    )
    RETURNING *
  `) as RegistrationRow[];

  return rows[0];
}

export async function getRegistrationById(sql: SqlClient, id: number): Promise<RegistrationRow | null> {
  const rows = (await sql`
    SELECT * FROM registrations WHERE id = ${id} LIMIT 1
  `) as RegistrationRow[];
  return rows[0] ?? null;
}

export async function updateRegistrationStatus(
  sql: SqlClient,
  id: number,
  status: 'approved' | 'rejected'
): Promise<RegistrationRow | null> {
  const rows = (await sql`
    UPDATE registrations
    SET
      status = ${status},
      updated_at = NOW(),
      approved_at = CASE WHEN ${status} = 'approved' THEN COALESCE(approved_at, NOW()) ELSE NULL END
    WHERE id = ${id}
    RETURNING *
  `) as RegistrationRow[];
  return rows[0] ?? null;
}

/** Comprueba si el email tiene al menos un registro aprobado en vigor. */
export async function isEmailApproved(sql: SqlClient, email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const rows = (await sql`
    SELECT id FROM registrations
    WHERE LOWER(email) = ${normalized} AND status = 'approved'
    LIMIT 1
  `) as Array<{ id: number }>;
  return rows.length > 0;
}

/** Guarda un código OTP hasheado con expiración de 15 minutos. */
export async function storeOtpCode(sql: SqlClient, email: string, codeHash: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  await sql`
    INSERT INTO otp_codes (email, code_hash, expires_at)
    VALUES (${normalized}, ${codeHash}, NOW() + INTERVAL '15 minutes')
  `;
}

/** Verifica un OTP activo y lo marca como usado si coincide (máx. 5 intentos). */
export async function verifyAndConsumeOtp(
  sql: SqlClient,
  email: string,
  codeHash: string
): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const rows = (await sql`
    SELECT id, code_hash, attempts
    FROM otp_codes
    WHERE LOWER(email) = ${normalized}
      AND used_at IS NULL
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  `) as Array<{ id: number; code_hash: string; attempts: number }>;

  const latest = rows[0];
  if (!latest || latest.attempts >= 5) return false;

  if (latest.code_hash !== codeHash) {
    await sql`UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ${latest.id}`;
    return false;
  }

  await sql`UPDATE otp_codes SET used_at = NOW() WHERE id = ${latest.id}`;
  return true;
}
