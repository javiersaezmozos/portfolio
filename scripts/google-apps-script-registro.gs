/**
 * Google Apps Script · Receptor Antifraude + Validación Gemini Vision (/registro)
 * Proyecto: javisaez.com — Trilogía «Trombón · Flexibilidad»
 *
 * Propiedades del script recomendadas (Configuración del proyecto -> Propiedades del script):
 * - GEMINI_API_KEY      : Clave gratuita de Google AI Studio (https://aistudio.google.com/apikey)
 * - BREVO_API_KEY       : Clave API de Brevo (https://app.brevo.com/settings/keys/api) para enviar
 *                         desde @javisaez.com (300 correos/día gratis).
 * - BREVO_SENDER_EMAIL  : Remitente verificado en Brevo (por defecto: registro@javisaez.com).
 * - BREVO_SENDER_NAME   : Nombre visible del remitente (por defecto: Javi Sáez).
 * - ADMIN_REVIEW_EMAIL  : Correo donde llegan los tickets dudosos (ej: orders@javisaez.com;
 *                         si no se define, usa el propietario del script en Gmail).
 */

const SHEET_NAME = 'Registros_Vol1';
const DRIVE_FOLDER_NAME = 'Recibos_Trombon_Flexibilidad';
const GEMINI_MODEL = 'gemini-2.0-flash';

const HEADERS = [
  'Fecha_Envio_ISO',
  'Fecha_Servidor',
  'Nombre',
  'Email',
  'Edicion_Canal',
  'Referencia_Amazon',
  'Pedido_Normalizado',
  'Idioma',
  'Notas',
  'Enlace_Recibo',
  'Hash_Imagen',
  'Estado_Verificacion',
];

const COL_EMAIL = 4;
const COL_ORDER_KEY = 7;
const COL_IMAGE_HASH = 11;

function sanitizeCell(value, maxLength) {
  const str = String(value || '').trim().slice(0, maxLength || 500);
  if (/^[=+\-@\t\r]/.test(str)) {
    return "'" + str;
  }
  return str;
}

function normalizeOrderKey(orderId) {
  return String(orderId || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function bytesToHex(bytes) {
  return bytes
    .map(function (b) {
      const v = (b < 0 ? b + 256 : b).toString(16);
      return v.length === 1 ? '0' + v : v;
    })
    .join('');
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0 || sheet.getLastColumn() < HEADERS.length) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getOrCreateReceiptsFolder() {
  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

function checkDuplicatesAndRateLimit(sheet, email, orderKey, imageHash) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { duplicateType: null, recentCount: 0 };
  }

  const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  const normalizedEmail = email.toLowerCase();
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  let recentCount = 0;

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const rowDate = row[1] instanceof Date ? row[1].getTime() : 0;
    const rowEmail = String(row[COL_EMAIL - 1] || '').replace(/^'/, '').toLowerCase();
    const rowOrderKey = String(row[COL_ORDER_KEY - 1] || '').replace(/^'/, '');
    const rowHash = String(row[COL_IMAGE_HASH - 1] || '').replace(/^'/, '');

    if (rowEmail === normalizedEmail && rowDate >= oneDayAgo) {
      recentCount++;
    }
    if (orderKey && rowOrderKey === orderKey) {
      return { duplicateType: 'DUPLICADO_PEDIDO (Posible fraude)', recentCount: recentCount };
    }
    if (imageHash && rowHash === imageHash) {
      return { duplicateType: 'DUPLICADO_IMAGEN (Posible fraude)', recentCount: recentCount };
    }
  }

  return { duplicateType: null, recentCount: recentCount };
}

function validateReceiptWithGemini(apiKey, receiptBase64, receiptMime, orderId, channel, buyerName) {
  if (!apiKey) {
    return { veredicto: 'DUDOSO', confianza: 0, motivo: 'GEMINI_API_KEY no configurada en Propiedades del script' };
  }

  try {
    const endpoint =
      'https://generativelanguage.googleapis.com/v1beta/models/' +
      GEMINI_MODEL +
      ':generateContent?key=' +
      encodeURIComponent(apiKey);

    const prompt = [
      'Eres un auditor antifraude de la editorial musical de Javier Sáez Mozos.',
      'Analiza la imagen adjunta enviada por "' + buyerName + '" que afirma haber comprado "' + channel + '" en Amazon con número de pedido "' + orderId + '".',
      'Comprueba si la imagen muestra un comprobante, factura o pantalla real de pedido de Amazon/Kindle del método "Trombón Flexibilidad" / "Flexibility" / "Javier Sáez".',
      'Criterios estrictos:',
      '- APROBADO: solo si se ve claramente que es un pedido/recibo real de Amazon, coincide el número de pedido (o referencia equivalente) y aparece el libro o un pedido de libro coherente sin indicios de manipulación.',
      '- DUDOSO: si la imagen está borrosa, recortada sin el número de pedido, el número no se distingue bien o faltan datos para estar 100 % seguro.',
      '- RECHAZADO: si no tiene nada que ver con una compra de Amazon/Kindle o parece un intento de fraude obvio.',
      'Responde SOLO JSON con esta estructura exacta: {"veredicto":"APROBADO|DUDOSO|RECHAZADO","confianza":0,"motivo":"explicación breve en español","pedido_detectado":"texto o vacío"}'
    ].join('\n');

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: receiptMime || 'image/jpeg',
                data: receiptBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    };

    const response = UrlFetchApp.fetch(endpoint, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(requestBody),
      muteHttpExceptions: true,
    });

    const code = response.getResponseCode();
    const rawText = response.getContentText();
    if (code < 200 || code >= 300) {
      console.error('[Gemini] Error HTTP', code, rawText);
      return { veredicto: 'DUDOSO', confianza: 0, motivo: 'Error API Gemini HTTP ' + code };
    }

    const parsed = JSON.parse(rawText);
    const modelText =
      parsed &&
      parsed.candidates &&
      parsed.candidates[0] &&
      parsed.candidates[0].content &&
      parsed.candidates[0].content.parts &&
      parsed.candidates[0].content.parts[0] &&
      parsed.candidates[0].content.parts[0].text;

    if (!modelText) {
      return { veredicto: 'DUDOSO', confianza: 0, motivo: 'Respuesta vacía de Gemini' };
    }

    const verdictObj = JSON.parse(modelText);
    return {
      veredicto: String(verdictObj.veredicto || 'DUDOSO').toUpperCase(),
      confianza: Number(verdictObj.confianza || 0),
      motivo: String(verdictObj.motivo || 'Sin detalles'),
      pedidoDetectado: String(verdictObj.pedido_detectado || ''),
    };
  } catch (err) {
    console.error('[Gemini] Excepción validando recibo:', err);
    return { veredicto: 'DUDOSO', confianza: 0, motivo: 'Excepción técnica al consultar Gemini' };
  }
}

/**
 * Envía un correo transaccional vía Brevo (desde @javisaez.com).
 * Si BREVO_API_KEY no está configurada, hace fallback controlado a MailApp.
 */
function sendEmailViaBrevo_(params) {
  const props = PropertiesService.getScriptProperties();
  const brevoKey = props.getProperty('BREVO_API_KEY');
  const senderEmail = props.getProperty('BREVO_SENDER_EMAIL') || 'registro@javisaez.com';
  const senderName = props.getProperty('BREVO_SENDER_NAME') || 'Javi Sáez';

  if (!brevoKey) {
    console.warn('BREVO_API_KEY no configurada; usando MailApp como fallback.');
    const mailOptions = {
      to: params.to,
      replyTo: params.replyTo || senderEmail,
      subject: params.subject,
      body: params.textBody,
    };
    if (params.attachmentBlob) {
      mailOptions.attachments = [params.attachmentBlob];
    }
    MailApp.sendEmail(mailOptions);
    return;
  }

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: params.to }],
    replyTo: { email: params.replyTo || senderEmail },
    subject: params.subject,
    textContent: params.textBody,
  };

  if (params.tags && params.tags.length > 0) {
    payload.tags = params.tags;
  }

  if (params.attachmentBlob) {
    payload.attachment = [
      {
        name: params.attachmentBlob.getName() || 'recibo.jpg',
        content: Utilities.base64Encode(params.attachmentBlob.getBytes()),
      },
    ];
  }

  const response = UrlFetchApp.fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      accept: 'application/json',
      'api-key': brevoKey,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  const code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('Brevo HTTP ' + code + ': ' + response.getContentText());
  }
}

function sendBuyerApprovalEmail(buyerEmail, buyerName, lang, orderId, replyToEmail) {
  const templates = {
    es: {
      subject: 'Activación confirmada · Trombón Flexibilidad Vol. 1 (' + orderId + ')',
      body:
        'Hola ' + buyerName + ',\n\n' +
        'Hemos verificado correctamente tu compra de «Trombón · Flexibilidad (Volumen 1 · Elemental)» (Pedido: ' + orderId + ').\n\n' +
        'Tus accesos oficiales ya están activos:\n' +
        '• Escaparate interactivo y visor de partituras: https://www.javisaez.com/es/metodos/flexibilidad\n' +
        '• Acceso directo mediante los 15 códigos QR impresos en tu libro (/e/v1-n1 ... /e/v1-n3-amp).\n\n' +
        'Si necesitas ayuda técnica o pedagógica con el método, responde directamente a este correo.\n\n' +
        'Un saludo musical,\nJavier Sáez Mozos\nhttps://www.javisaez.com',
    },
    en: {
      subject: 'Activation confirmed · Trombone Flexibility Vol. 1 (' + orderId + ')',
      body:
        'Hello ' + buyerName + ',\n\n' +
        'Your purchase of «Trombone · Flexibility (Volume 1 · Elementary)» (Order: ' + orderId + ') has been verified.\n\n' +
        'Your official resources are ready:\n' +
        '• Interactive Trilogy Lab & Score Viewer: https://www.javisaez.com/en/methods/flexibility\n' +
        '• Direct access via the 15 QR codes printed inside your book.\n\n' +
        'Reply directly to this email anytime if you need technical or study assistance.\n\n' +
        'Best regards,\nJavier Sáez Mozos\nhttps://www.javisaez.com',
    },
    de: {
      subject: 'Freischaltung bestätigt · Posaune Flexibilität Bd. 1 (' + orderId + ')',
      body:
        'Hallo ' + buyerName + ',\n\n' +
        'Ihr Kauf von «Posaune · Flexibilität (Band 1)» (Bestellung: ' + orderId + ') wurde erfolgreich bestätigt.\n\n' +
        'Ihre digitalen Ressourcen sind aktiv:\n' +
        '• Interaktiver Bereich: https://www.javisaez.com/en/methods/flexibility\n' +
        '• Direkter Zugriff über alle 15 QR-Codes in Ihrem Buch.\n\n' +
        'Bei Fragen antworten Sie einfach direkt auf diese E-Mail.\n\n' +
        'Mit musikalischen Grüßen,\nJavier Sáez Mozos\nhttps://www.javisaez.com',
    },
    it: {
      subject: 'Attivazione confermata · Trombone Flessibilità Vol. 1 (' + orderId + ')',
      body:
        'Ciao ' + buyerName + ',\n\n' +
        'Il tuo acquisto di «Trombone · Flessibilità (Volume 1)» (Ordine: ' + orderId + ') è stato verificato con successo.\n\n' +
        'Le tue risorse ufficiali sono attive:\n' +
        '• Portale interattivo: https://www.javisaez.com/en/methods/flexibility\n' +
        '• Accesso diretto tramite i 15 codici QR stampati nel libro.\n\n' +
        'Per qualsiasi domanda puoi rispondere direttamente a questa e-mail.\n\n' +
        'Un cordiale saluto,\nJavier Sáez Mozos\nhttps://www.javisaez.com',
    },
  };

  const t = templates[lang] || templates.es;
  sendEmailViaBrevo_({
    to: buyerEmail,
    replyTo: replyToEmail,
    subject: t.subject,
    textBody: t.body,
    tags: ['registro-vol1', 'aprobado-' + (lang || 'es')],
  });
}

function sendManualReviewEmail(adminEmail, details, imageBlob) {
  const replyMailto =
    'mailto:' +
    encodeURIComponent(details.email) +
    '?subject=' +
    encodeURIComponent('Activación Vol. 1 (' + details.orderId + ')');

  const body = [
    'TICKET PENDIENTE DE REVISIÓN MANUAL (' + details.verdict + ')',
    '------------------------------------------------------------',
    'Nombre         : ' + details.name,
    'Email          : ' + details.email,
    'Edición        : ' + details.channel,
    'Pedido Amazon  : ' + details.orderId,
    'Idioma         : ' + details.lang,
    'Notas          : ' + (details.notes || '(sin notas)'),
    'Archivo Drive  : ' + details.driveUrl,
    'Análisis Gemini: ' + details.reason + (details.detectedOrder ? ' | Pedido leído: ' + details.detectedOrder : ''),
    '',
    'Respuesta rápida al comprador:',
    replyMailto,
  ].join('\n');

  sendEmailViaBrevo_({
    to: adminEmail,
    replyTo: details.email,
    subject: '[TICKET VOL.1 · DUDOSO] ' + details.orderId + ' - ' + details.name,
    textBody: body,
    attachmentBlob: imageBlob || null,
    tags: ['registro-vol1', 'revision-manual'],
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);

    if (!e || !e.postData || !e.postData.contents) {
      console.error('[Registro] Petición vacía sin postData.');
      return jsonResponse({ ok: false, error: 'Empty payload' });
    }

    const payload = JSON.parse(e.postData.contents);

    // 1. Filtro silencioso de bots (Honeypot)
    if (String(payload.website || '').trim() !== '') {
      console.warn('[Registro] Bot bloqueado por campo honeypot.');
      return jsonResponse({ ok: true, verdict: 'DUDOSO' });
    }

    const name = sanitizeCell(payload.name, 120);
    const email = sanitizeCell(payload.email, 160);
    const channel = sanitizeCell(payload.channel, 60);
    const orderId = sanitizeCell(payload.orderId, 120);
    const orderKey = normalizeOrderKey(orderId);
    const lang = sanitizeCell(payload.lang || 'es', 10);
    const notes = sanitizeCell(payload.notes, 1000);
    const submittedAt = sanitizeCell(payload.submittedAt, 40);
    const receiptBase64 = String(payload.receiptBase64 || '');
    const receiptMime = String(payload.receiptMime || 'image/jpeg');
    const receiptName = String(payload.receiptName || 'recibo.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');

    if (!name || !email || !orderId || !receiptBase64) {
      return jsonResponse({ ok: false, error: 'Missing required fields or receipt' });
    }

    const props = PropertiesService.getScriptProperties();
    const geminiApiKey = props.getProperty('GEMINI_API_KEY') || '';
    const adminEmail =
      props.getProperty('ADMIN_REVIEW_EMAIL') ||
      Session.getEffectiveUser().getEmail();

    const imageBytes = Utilities.base64Decode(receiptBase64);
    const imageHash = bytesToHex(
      Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, imageBytes)
    );

    const sheet = getOrCreateSheet();
    const check = checkDuplicatesAndRateLimit(sheet, email, orderKey, imageHash);

    // 2. Control de duplicados (Pedido o Imagen idéntica)
    if (check.duplicateType) {
      sheet.appendRow([
        submittedAt || new Date().toISOString(),
        new Date(),
        name,
        email,
        channel,
        orderId,
        "'" + orderKey,
        lang,
        notes,
        '(Omitido por duplicado)',
        "'" + imageHash,
        check.duplicateType,
      ]);
      console.warn('[Registro] Intento duplicado detectado:', check.duplicateType, orderKey);
      return jsonResponse({ ok: true, verdict: 'DUPLICADO' });
    }

    // 3. Control de límite diario por email (máx 3 envíos en 24h)
    if (check.recentCount >= 3) {
      sheet.appendRow([
        submittedAt || new Date().toISOString(),
        new Date(),
        name,
        email,
        channel,
        orderId,
        "'" + orderKey,
        lang,
        notes,
        '(Omitido por límite 24h)',
        "'" + imageHash,
        'BLOQUEADO (Límite 24h)',
      ]);
      return jsonResponse({ ok: true, verdict: 'DUPLICADO' });
    }

    // 4. Guardar captura privada en Google Drive
    const folder = getOrCreateReceiptsFolder();
    const safeFileName = (orderKey || 'SIN_PEDIDO') + '_' + Date.now() + '_' + receiptName;
    const imageBlob = Utilities.newBlob(imageBytes, receiptMime, safeFileName);
    const driveFile = folder.createFile(imageBlob);
    const driveUrl = driveFile.getUrl();

    // 5. Validación automática con Gemini Vision
    const gemini = validateReceiptWithGemini(
      geminiApiKey,
      receiptBase64,
      receiptMime,
      orderId,
      channel,
      name
    );

    let statusText = '';
    let publicVerdict = 'DUDOSO';

    if (gemini.veredicto === 'APROBADO') {
      statusText = 'Verificado por IA (' + gemini.confianza + '%) — ' + gemini.motivo;
      publicVerdict = 'APROBADO';
      sendBuyerApprovalEmail(email, name, lang, orderId, 'orders@javisaez.com');
    } else {
      statusText = 'Revisión manual (' + gemini.veredicto + ') — ' + gemini.motivo;
      publicVerdict = 'DUDOSO';
      sendManualReviewEmail(
        adminEmail,
        {
          name: name,
          email: email,
          channel: channel,
          orderId: orderId,
          lang: lang,
          notes: notes,
          driveUrl: driveUrl,
          verdict: gemini.veredicto,
          reason: gemini.motivo,
          detectedOrder: gemini.pedidoDetectado || '',
        },
        imageBlob
      );
    }

    sheet.appendRow([
      submittedAt || new Date().toISOString(),
      new Date(),
      name,
      email,
      channel,
      orderId,
      "'" + orderKey,
      lang,
      notes,
      driveUrl,
      "'" + imageHash,
      statusText,
    ]);

    console.log('[Registro] Procesado con veredicto:', publicVerdict, 'para pedido:', orderKey);
    return jsonResponse({ ok: true, verdict: publicVerdict });
  } catch (err) {
    console.error('[Registro] Error en doPost:', err);
    return jsonResponse({ ok: false, error: 'Internal server error' });
  } finally {
    try {
      lock.releaseLock();
    } catch (_releaseErr) {
      // El bloqueo ya fue liberado o expiró
    }
  }
}

function doGet() {
  return jsonResponse({
    ok: true,
    service: 'javisaez-registro-webhook-v2-antifraude',
    status: 'ready',
  });
}
