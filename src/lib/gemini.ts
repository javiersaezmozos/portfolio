export interface GeminiVerdict {
  verdict: 'APROBADO' | 'DUDOSO' | 'RECHAZADO';
  confidence: number;
  reason: string;
}

const GEMINI_MODEL = 'gemini-2.5-flash';

export function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function callGeminiOnce(
  apiKey: string,
  prompt: string,
  base64Image: string,
  mimeType: string
): Promise<{ status: number; ok: boolean; data?: unknown; rawError?: string }> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType || 'image/jpeg', data: base64Image } },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    }),
  });

  if (!res.ok) {
    return { status: res.status, ok: false, rawError: await res.text().catch(() => '') };
  }

  return { status: res.status, ok: true, data: await res.json() };
}

/**
 * Valida una captura de recibo con Gemini 2.5 Flash.
 * Si la clave principal devuelve 429/503 y existe `paidKey`, reintenta automáticamente.
 * Ante cualquier fallo técnico devuelve `DUDOSO` para preservar el registro en revisión manual.
 */
export async function validateReceiptWithGemini(params: {
  primaryKey: string;
  paidKey?: string;
  imageBytes: Uint8Array;
  mimeType: string;
  orderId: string;
  channel: string;
  buyerName: string;
}): Promise<GeminiVerdict> {
  const { primaryKey, paidKey, imageBytes, mimeType, orderId, channel, buyerName } = params;

  if (!primaryKey && !paidKey) {
    return { verdict: 'DUDOSO', confidence: 0, reason: 'GEMINI_API_KEY no configurada' };
  }

  const prompt = [
    'Eres un auditor antifraude de la editorial musical de Javier Sáez Mozos.',
    `Analiza la imagen adjunta enviada por "${buyerName}" que afirma haber comprado "${channel}" en Amazon con número de pedido "${orderId}".`,
    'Comprueba si la imagen muestra un comprobante, factura o pantalla real de pedido de Amazon/Kindle del método "Trombón Flexibilidad" / "Flexibility" / "Javier Sáez".',
    'Criterios estrictos:',
    '- APROBADO: solo si se ve claramente que es un pedido/recibo real de Amazon, coincide el número de pedido (o referencia equivalente) y aparece el libro o un pedido de libro coherente sin indicios de manipulación.',
    '- DUDOSO: si la imagen está borrosa, recortada sin el número de pedido, el número no se distingue bien o faltan datos para estar 100 % seguro.',
    '- RECHAZADO: si no tiene nada que ver con una compra de Amazon/Kindle o parece un intento de fraude obvio.',
    'Responde SOLO JSON con esta estructura exacta: {"veredicto":"APROBADO|DUDOSO|RECHAZADO","confianza":0,"motivo":"explicación breve en español"}',
  ].join('\n');

  try {
    const base64 = uint8ToBase64(imageBytes);
    let response = await callGeminiOnce(primaryKey || paidKey!, prompt, base64, mimeType);

    if (!response.ok && (response.status === 429 || response.status === 503) && paidKey && paidKey !== primaryKey) {
      console.warn(`[Gemini] Cuota/servicio ${response.status} en clave principal; reintentando con GEMINI_API_KEY_PAID.`);
      response = await callGeminiOnce(paidKey, prompt, base64, mimeType);
    }

    if (!response.ok || !response.data) {
      console.error('[Gemini] Error HTTP', response.status, response.rawError?.slice(0, 300));
      return { verdict: 'DUDOSO', confidence: 0, reason: `Error API Gemini HTTP ${response.status}` };
    }

    const payload = response.data as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const modelText = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!modelText) {
      return { verdict: 'DUDOSO', confidence: 0, reason: 'Respuesta vacía de Gemini' };
    }

    const parsed = JSON.parse(modelText) as { veredicto?: string; confianza?: number; motivo?: string };
    const rawVerdict = String(parsed.veredicto || 'DUDOSO').toUpperCase();
    const verdict: GeminiVerdict['verdict'] =
      rawVerdict === 'APROBADO' || rawVerdict === 'RECHAZADO' ? rawVerdict : 'DUDOSO';

    return {
      verdict,
      confidence: Number(parsed.confianza || 0),
      reason: String(parsed.motivo || 'Sin detalles'),
    };
  } catch (err) {
    console.error('[Gemini] Excepción validando recibo:', err);
    return { verdict: 'DUDOSO', confidence: 0, reason: 'Excepción técnica al consultar Gemini' };
  }
}
