# Infraestructura y Cuentas del Proyecto (`javisaez.com`)

Documento de referencia permanente para mantener el mapa exacto de servicios, límites y configuraciones sin depender de capturas repetidas.

---

## 1. Alojamiento de Vídeo y Audio: **Adilo**
- **Plan contratado:** **Elite License (`$99 / lifetime` — Vitalicio, `0 $/mes`)** + **Agency License Add-on** instalado.
- **Estado:** `ACTIVE` (no renueva).
- **Límites reales de la cuenta:**
  - **Archivos / Almacenamiento:** Ilimitado (`∞ files`, `∞ GB`).
  - **Ancho de banda mensual:** **`1.300 GB / mes`** (`300 GB` base + Add-on `1.000 GB MONTHLY`).
  - **Dominios / Marcas:** `105 domains`, `105 brands`, canales `unlimited`.
  - **Subtítulos IA:** `100 min`.
  - **DRM Anti-piracy:** **No incluido** (`0 UNIQUE PEOPLE`).
  - **Watermark Sessions:** `100 UNIQUE PEOPLE` *(no usado para estudio de partituras)*.
  - **Funciones clave incluidas:** `Remove Adilo branding`, `All embedding access`, `Customizable player`, `Video chapters`, `Playlists & media galleries`, `QR code embed`, `All player behavior access`, `API & Zapier access`.
- **Configuración aplicada en Proyecto `Flexibilidad · Vol. 1`:**
  - `Lock Project`: Desactivado.
  - `Turnkey SEO`: Desactivado.
  - `Who can watch`: `People with the Private link`.
  - `Where can this Video be Embedded?`: `Specific domains` → añadir `javisaez.com` y `www.javisaez.com`.
  - `Who can comment`: `Project collaborators`.
  - `Branding`: `Player Color = #d4af37`, `Player Branding = OFF`, `Commenting widget = OFF`, `Recommended content = OFF`.
  - `Controls`: `Autoplay = OFF`, `Playbar = ON`, `Volume = ON`, `Loop = ON`, `Disable right click = ON`, `Settings (Playback Speed + Quality) = ON`, `Fullscreen = ON`, `Prefer HD = ON`, `Control Visibility = Show on hover`.

---

## 2. Dominio, Correo y Código
- **Dominio:** `javisaez.com` registrado en **DonDominio**.
- **Correo entrante (Alias):** **ImprovMX** (redirección `@javisaez.com` → Gmail personal; ej. `orders@javisaez.com`).
- **Correo saliente transaccional:** **Brevo** (`Free`: **`300 emails/día`**, remitente verificado `@javisaez.com`; salto opcional a `Starter` desde `9 $/mes` para `5.000/mes` sin límite diario).
- **Repositorio y CI:** **GitHub** (`javiersaezmozos/portfolio.git`).

---

## 3. Hosting, Base de Datos e IA (Arquitectura QR + `/registro`)
- **Hosting y SSR:** **Cloudflare Pages** (`Free`: `0 $/mes`, uso comercial permitido, ancho de banda ilimitado, `100.000 req/día`, límite `10 ms` CPU por invocación).
  - *En el lanzamiento del Vol. 1:* activar **Workers Paid (`5 $/mes`)** para subir a `10 millones req/mes` y `30 s` de CPU por invocación.
  - *Nota previa:* Anteriormente se contempló Vercel (`vercel.json`) y Google Apps Script (`scripts/google-apps-script-registro.gs`), sustituidos por esta arquitectura unificada en Edge SSR.
- **Base de datos:** **Neon Postgres** (`Free`: `0 $/mes`, `1 GB` por proyecto, `100 CU-hours/mes`, auto-suspensión a los 5 min sin pausa semanal de 7 días).
  - *Escala:* `Launch` (`0 $/mes` fijo + pago por uso `$0.106/CU-h`, `$0.35/GB`).
- **Validación de tickets IA:** **Gemini API (`gemini-2.5-flash`)** con soporte para clave gratuita + fallback opcional a clave de pago por uso (`< 0,05 €/100 tickets`). Si falla o es ambiguo → estado `pending` y email con adjunto al administrador.

---

## 4. Variables de Entorno Necesarias (`.env` / Cloudflare Pages Secrets)
```env
DATABASE_URL=              # Cadena de conexión Neon Postgres (serverless)
SESSION_SECRET=            # Secreto aleatorio largo (>=32 bytes hex) para cookies HMAC
APPROVAL_SECRET=           # Secreto aleatorio largo para enlaces HMAC de revisión admin
BREVO_API_KEY=             # Clave API v3 de Brevo
BREVO_SENDER_EMAIL=registro@javisaez.com
BREVO_SENDER_NAME=Javier Sáez
ADMIN_REVIEW_EMAIL=orders@javisaez.com
GEMINI_API_KEY=            # Clave principal de Gemini API (Free o Pay-as-you-go)
GEMINI_API_KEY_PAID=       # (Opcional) Clave de respaldo de pago por uso si la principal da 429
```
