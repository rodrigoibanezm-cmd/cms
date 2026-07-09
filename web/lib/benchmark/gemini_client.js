import { resolveGeminiModel } from '../gemini_models.js';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(err) {
  const status = err?.status || err?.code;
  return status === 429 || status === 500 || status === 503;
}

function apiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('Falta GEMINI_API_KEY');
  return key;
}

function endpoint(model) {
  const encodedModel = encodeURIComponent(resolveGeminiModel(model));
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodedModel}:generateContent?key=${apiKey()}`;
}

function buildPayload({ prompt, image }) {
  if (!image?.base64) throw new Error('Imagen vacía para Gemini');

  return {
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: image.mediaType || 'image/jpeg',
              data: image.base64,
            },
          },
        ],
      },
    ],
  };
}

function extractText(data) {
  return data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('\n')
    .trim() || '';
}

async function requestGemini({ model, prompt, image }) {
  const res = await fetch(endpoint(model), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildPayload({ prompt, image })),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.message || `Gemini HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }

  const text = extractText(data);
  if (!text) throw new Error('Gemini respondió sin texto');
  return text;
}

export async function callGemini({ model, prompt, image, retries = 4 }) {
  const resolvedModel = resolveGeminiModel(model);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await requestGemini({ model: resolvedModel, prompt, image });
    } catch (err) {
      if (!isRetryable(err) || attempt === retries) throw err;

      const waitMs = attempt * 7000;
      console.warn(`Gemini ${resolvedModel} falló. Reintento ${attempt}/${retries} en ${waitMs / 1000}s...`);
      await sleep(waitMs);
    }
  }

  throw new Error(`Gemini ${resolvedModel} falló sin respuesta`);
}
