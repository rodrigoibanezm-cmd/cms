import { GoogleGenAI } from '@google/genai';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(err) {
  const status = err?.status || err?.code;
  return status === 429 || status === 500 || status === 503;
}

export async function callGemini({ model, prompt, image, retries = 4 }) {
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: image.mediaType,
                  data: image.base64,
                },
              },
            ],
          },
        ],
      });

      return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (err) {
      if (!isRetryable(err) || attempt === retries) throw err;

      const waitMs = attempt * 7000;
      console.warn(`Gemini ${model} falló. Reintento ${attempt}/${retries} en ${waitMs / 1000}s...`);
      await sleep(waitMs);
    }
  }

  throw new Error(`Gemini ${model} falló sin respuesta`);
}
