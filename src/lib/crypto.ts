const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(str: string): Uint8Array | null {
  try {
    const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
    const binary = atob(padded);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      out[i] = binary.charCodeAt(i);
    }
    return out;
  } catch {
    return null;
  }
}

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

/** Calcula el hash SHA-256 hexadecimal de un binario o cadena usando Web Crypto API. */
export async function sha256Hex(input: ArrayBuffer | Uint8Array | string): Promise<string> {
  const data = typeof input === 'string' ? encoder.encode(input) : input;
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(digest);
}

/** Genera una firma HMAC-SHA256 en formato base64url. */
export async function signHmac(secret: string, message: string): Promise<string> {
  if (!secret) throw new Error('Missing HMAC secret');
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return toBase64Url(new Uint8Array(signature));
}

/** Verifica una firma HMAC-SHA256 en tiempo constante. */
export async function verifyHmac(secret: string, message: string, sig: string): Promise<boolean> {
  if (!secret || !sig) return false;
  try {
    const expected = await signHmac(secret, message);
    const a = fromBase64Url(expected);
    const b = fromBase64Url(sig);
    if (!a || !b) return false;
    return timingSafeEqualBytes(a, b);
  } catch {
    return false;
  }
}

export const SESSION_COOKIE_NAME = 'js_flex_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 365; // 1 año

/** Emite el token firmado de sesión para la cookie HttpOnly del alumno. */
export async function createSessionToken(secret: string, email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = toBase64Url(encoder.encode(JSON.stringify({ email: normalized, exp })));
  const sig = await signHmac(secret, payload);
  return `${payload}.${sig}`;
}

/** Valida el token de sesión y devuelve el email normalizado si es auténtico y vigente. */
export async function verifySessionToken(secret: string, token: string | undefined): Promise<string | null> {
  if (!secret || !token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;

  const validSig = await verifyHmac(secret, payload, sig);
  if (!validSig) return null;

  const bytes = fromBase64Url(payload);
  if (!bytes) return null;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as { email?: string; exp?: number };
    if (!parsed.email || !parsed.exp) return null;
    if (Math.floor(Date.now() / 1000) > parsed.exp) return null;
    return parsed.email.trim().toLowerCase();
  } catch {
    return null;
  }
}

const APPROVAL_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 días

/** Genera una firma HMAC con expiración para el enlace de revisión administrativa. */
export async function createApprovalSignature(
  secret: string,
  registrationId: number,
  exp = Math.floor(Date.now() / 1000) + APPROVAL_TTL_SECONDS
): Promise<{ exp: number; sig: string }> {
  const sig = await signHmac(secret, `review:${registrationId}:${exp}`);
  return { exp, sig };
}

/** Valida la firma HMAC y la expiración del enlace de revisión administrativa. */
export async function verifyApprovalSignature(
  secret: string,
  registrationId: number,
  exp: number,
  sig: string
): Promise<boolean> {
  if (!Number.isFinite(registrationId) || !Number.isFinite(exp)) return false;
  if (Math.floor(Date.now() / 1000) > exp) return false;
  return verifyHmac(secret, `review:${registrationId}:${exp}`, sig);
}

/** Genera un código numérico aleatorio de 6 dígitos criptográficamente seguro. */
export function generateOtp6(): string {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return String(arr[0] % 1_000_000).padStart(6, '0');
}

/** Normaliza un identificador de pedido Amazon para bloqueo de duplicados. */
export function normalizeOrderKey(orderId: string): string {
  return String(orderId || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}
