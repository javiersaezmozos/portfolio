/**
 * Google Apps Script · Receptor de registros de compradores (/registro)
 * Proyecto: javisaez.com — Trilogía «Trombón · Flexibilidad»
 *
 * Instrucciones:
 * 1. Crear una hoja de cálculo en Google Sheets.
 * 2. Ir a Extensiones -> Apps Script y pegar este código completo.
 * 3. Implementar -> Nueva implementación -> Aplicación web:
 *    - Ejecutar como: Yo
 *    - Quién tiene acceso: Cualquier usuario
 * 4. Copiar la URL terminada en /exec y guardarla en Vercel como
 *    variable de entorno `PUBLIC_REGISTRO_WEBHOOK_URL` (y en `.env` local).
 */

const SHEET_NAME = 'Registros_Vol1';
const HEADERS = [
  'Fecha_Envio_ISO',
  'Fecha_Servidor',
  'Nombre',
  'Email',
  'Edicion_Canal',
  'Referencia_Amazon',
  'Idioma',
  'Notas',
  'Estado_Verificacion',
];

/**
 * Mitiga inyección de fórmulas en hojas de cálculo (=, +, -, @ al inicio).
 */
function sanitizeCell(value, maxLength) {
  const str = String(value || '').trim().slice(0, maxLength || 500);
  if (/^[=+\-@\t\r]/.test(str)) {
    return "'" + str;
  }
  return str;
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
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    if (!e || !e.postData || !e.postData.contents) {
      console.error('[Registro] Petición vacía sin cuerpo postData.');
      return jsonResponse({ ok: false, error: 'Empty payload' });
    }

    const payload = JSON.parse(e.postData.contents);
    const name = sanitizeCell(payload.name, 120);
    const email = sanitizeCell(payload.email, 160);
    const channel = sanitizeCell(payload.channel, 60);
    const orderId = sanitizeCell(payload.orderId, 120);
    const lang = sanitizeCell(payload.lang || 'es', 10);
    const notes = sanitizeCell(payload.notes, 1000);
    const submittedAt = sanitizeCell(payload.submittedAt, 40);

    if (!name || !email || !orderId) {
      console.warn('[Registro] Campos obligatorios incompletos:', { hasName: !!name, hasEmail: !!email, hasOrderId: !!orderId });
      return jsonResponse({ ok: false, error: 'Missing required fields' });
    }

    const sheet = getOrCreateSheet();
    sheet.appendRow([
      submittedAt || new Date().toISOString(),
      new Date(),
      name,
      email,
      channel,
      orderId,
      lang,
      notes,
      'Pendiente de revisión',
    ]);

    console.log('[Registro] Fila guardada correctamente para canal:', channel, 'idioma:', lang);
    return jsonResponse({ ok: true });
  } catch (err) {
    console.error('[Registro] Error procesando doPost:', err);
    return jsonResponse({ ok: false, error: 'Internal server error' });
  } finally {
    try {
      lock.releaseLock();
    } catch (_releaseErr) {
      // El bloqueo ya expiró o no llegó a adquirirse
    }
  }
}

function doGet() {
  return jsonResponse({
    ok: true,
    service: 'javisaez-registro-webhook',
    status: 'ready',
  });
}
