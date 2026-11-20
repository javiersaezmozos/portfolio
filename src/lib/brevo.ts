import { uint8ToBase64 } from './gemini';

export type SupportedLang = 'es' | 'en' | 'de' | 'it';

const METHOD_PATHS: Record<SupportedLang, string> = {
  es: 'https://www.javisaez.com/es/metodos/flexibilidad',
  en: 'https://www.javisaez.com/en/methods/flexibility',
  de: 'https://www.javisaez.com/de/methoden/flexibilitaet',
  it: 'https://www.javisaez.com/it/metodi/flessibilita',
};

export interface BrevoConfig {
  apiKey: string;
  senderEmail: string;
  senderName: string;
  replyTo?: string;
}

/** Envía un correo transaccional mediante la API v3 de Brevo. */
export async function sendBrevoEmail(
  cfg: BrevoConfig,
  params: {
    to: string;
    subject: string;
    textContent: string;
    htmlContent?: string;
    tags?: string[];
    attachment?: { name: string; bytes: Uint8Array };
  }
): Promise<void> {
  if (!cfg.apiKey) {
    throw new Error('BREVO_API_KEY no configurada');
  }

  const body: Record<string, unknown> = {
    sender: { name: cfg.senderName || 'Javier Sáez', email: cfg.senderEmail || 'registro@javisaez.com' },
    to: [{ email: params.to }],
    replyTo: { email: params.replyTo || cfg.senderEmail || 'orders@javisaez.com' },
    subject: params.subject,
    textContent: params.textContent,
  };

  if (params.htmlContent) body.htmlContent = params.htmlContent;
  if (params.tags?.length) body.tags = params.tags;
  if (params.attachment) {
    body.attachment = [
      {
        name: params.attachment.name || 'recibo.jpg',
        content: uint8ToBase64(params.attachment.bytes),
      },
    ];
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': cfg.apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Brevo HTTP ${res.status}: ${errText.slice(0, 300)}`);
  }
}

export async function sendBuyerApprovalEmail(
  cfg: BrevoConfig,
  params: { to: string; name: string; lang: SupportedLang; orderId: string }
): Promise<void> {
  const url = METHOD_PATHS[params.lang] || METHOD_PATHS.es;
  const templates: Record<SupportedLang, { subject: string; text: string }> = {
    es: {
      subject: `Activación confirmada · Trombón Flexibilidad Vol. 1 (${params.orderId})`,
      text:
        `Hola ${params.name},\n\n` +
        `Hemos verificado correctamente tu compra de «Trombón · Flexibilidad (Volumen 1 · Elemental)» (Pedido: ${params.orderId}).\n\n` +
        `Tus accesos oficiales ya están activos:\n` +
        `• Al escanear cualquier código QR de tu libro (/e/...), introduce tu correo (${params.to}) para recibir un código de 6 dígitos y activar tu dispositivo durante 1 año.\n` +
        `• Escaparate interactivo del método: ${url}\n\n` +
        `Si necesitas ayuda técnica o pedagógica, responde directamente a este correo.\n\nUn saludo musical,\nJavier Sáez Mozos`,
    },
    en: {
      subject: `Activation confirmed · Trombone Flexibility Vol. 1 (${params.orderId})`,
      text:
        `Hello ${params.name},\n\n` +
        `Your purchase of «Trombone · Flexibility (Volume 1 · Elementary)» (Order: ${params.orderId}) has been verified.\n\n` +
        `Your official resources are now active:\n` +
        `• When scanning any QR code in your book, enter your email (${params.to}) to receive a 6-digit code and unlock your device for 1 year.\n` +
        `• Method portal: ${url}\n\n` +
        `Reply directly to this email anytime if you need help.\n\nBest regards,\nJavier Sáez Mozos`,
    },
    de: {
      subject: `Freischaltung bestätigt · Posaune Flexibilität Bd. 1 (${params.orderId})`,
      text:
        `Hallo ${params.name},\n\n` +
        `Ihr Kauf von «Posaune · Flexibilität (Band 1)» (Bestellung: ${params.orderId}) wurde bestätigt.\n\n` +
        `Ihre digitalen Ressourcen sind aktiv:\n` +
        `• Geben Sie beim Scannen eines QR-Codes im Buch Ihre E-Mail (${params.to}) ein, um einen 6-stelligen Code zur Gerätefreischaltung zu erhalten.\n` +
        `• Methodenportal: ${url}\n\n` +
        `Bei Fragen antworten Sie einfach auf diese E-Mail.\n\nMit musikalischen Grüßen,\nJavier Sáez Mozos`,
    },
    it: {
      subject: `Attivazione confermata · Trombone Flessibilità Vol. 1 (${params.orderId})`,
      text:
        `Ciao ${params.name},\n\n` +
        `Il tuo acquisto di «Trombone · Flessibilità (Volume 1)» (Ordine: ${params.orderId}) è stato verificato.\n\n` +
        `Le tue risorse ufficiali sono attive:\n` +
        `• Scansionando qualsiasi QR del libro, inserisci la tua email (${params.to}) per ricevere un codice a 6 cifre e sbloccare il dispositivo per 1 anno.\n` +
        `• Portale del metodo: ${url}\n\n` +
        `Per assistenza rispondi direttamente a questa e-mail.\n\nUn cordiale saluto,\nJavier Sáez Mozos`,
    },
  };

  const t = templates[params.lang] || templates.es;
  await sendBrevoEmail(cfg, {
    to: params.to,
    subject: t.subject,
    textContent: t.text,
    tags: ['flexibilidad-vol1', 'activacion'],
  });
}

export async function sendOtpEmail(
  cfg: BrevoConfig,
  params: { to: string; otp: string; lang: SupportedLang }
): Promise<void> {
  const templates: Record<SupportedLang, { subject: string; text: string }> = {
    es: {
      subject: `Tu código de acceso: ${params.otp} · Trombón Flexibilidad`,
      text: `Tu código de verificación de un solo uso es: ${params.otp}\n\nCaduca en 15 minutos. Introdúcelo en la pantalla del ejercicio para activar este dispositivo.`,
    },
    en: {
      subject: `Your access code: ${params.otp} · Trombone Flexibility`,
      text: `Your one-time verification code is: ${params.otp}\n\nIt expires in 15 minutes. Enter it on the exercise page to unlock this device.`,
    },
    de: {
      subject: `Ihr Zugangscode: ${params.otp} · Posaune Flexibilität`,
      text: `Ihr einmaliger Bestätigungscode lautet: ${params.otp}\n\nEr läuft in 15 Minuten ab. Geben Sie ihn auf der Übungsseite ein.`,
    },
    it: {
      subject: `Il tuo codice di accesso: ${params.otp} · Trombone Flessibilità`,
      text: `Il tuo codice di verifica monouso è: ${params.otp}\n\nScade tra 15 minuti. Inseriscilo nella pagina dell'esercizio.`,
    },
  };

  const t = templates[params.lang] || templates.es;
  await sendBrevoEmail(cfg, {
    to: params.to,
    subject: t.subject,
    textContent: t.text,
    tags: ['flexibilidad-vol1', 'otp'],
  });
}

export async function sendAdminReviewEmail(
  cfg: BrevoConfig,
  params: {
    adminEmail: string;
    registrationId: number;
    buyerName: string;
    buyerEmail: string;
    orderId: string;
    channel: string;
    lang: string;
    aiReason: string;
    notes: string;
    reviewUrl: string;
    attachmentBytes?: Uint8Array;
    attachmentName?: string;
  }
): Promise<void> {
  const text = [
    'Se ha recibido un ticket de compra que requiere revisión manual:',
    '',
    `ID registro: #${params.registrationId}`,
    `Nombre: ${params.buyerName}`,
    `Email: ${params.buyerEmail}`,
    `Canal: ${params.channel}`,
    `Pedido Amazon: ${params.orderId}`,
    `Idioma: ${params.lang}`,
    `Motivo Gemini: ${params.aiReason}`,
    `Notas: ${params.notes || '(ninguna)'}`,
    '',
    `Revisar y aprobar/rechazar en 1 clic: ${params.reviewUrl}`,
  ].join('\n');

  const html = `
    <div style="font-family:sans-serif;max-width:560px;line-height:1.5;color:#111">
      <h2>Revisión manual · Ticket #${params.registrationId}</h2>
      <p><strong>Alumno:</strong> ${params.buyerName} (${params.buyerEmail})</p>
      <p><strong>Pedido Amazon:</strong> <code>${params.orderId}</code> (${params.channel} · ${params.lang})</p>
      <p><strong>Diagnóstico IA:</strong> ${params.aiReason}</p>
      ${params.notes ? `<p><strong>Notas:</strong> ${params.notes}</p>` : ''}
      <p style="margin-top:24px">
        <a href="${params.reviewUrl}" style="display:inline-block;padding:12px 20px;background:#b45309;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">
          Abrir ficha para Aprobar / Rechazar
        </a>
      </p>
      <p style="font-size:12px;color:#666;margin-top:16px">La captura del recibo va adjunta en este correo. El enlace caduca en 30 días y requiere confirmar pulsando el botón en la web.</p>
    </div>
  `;

  await sendBrevoEmail(cfg, {
    to: params.adminEmail,
    subject: `[Revisión] Pedido ${params.orderId} · ${params.buyerName}`,
    textContent: text,
    htmlContent: html,
    tags: ['flexibilidad-vol1', 'revision-admin'],
    attachment: params.attachmentBytes
      ? { name: params.attachmentName || `recibo-${params.registrationId}.jpg`, bytes: params.attachmentBytes }
      : undefined,
  });
}
