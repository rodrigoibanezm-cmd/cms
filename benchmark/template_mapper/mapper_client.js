import { GoogleGenAI } from '@google/genai';

function parseJson(raw) {
  try {
    return JSON.parse(String(raw).replace(/```json|```/g, '').trim());
  } catch {
    return { _parse_error: true, _raw: raw };
  }
}

export async function callMapper(prompt, model = 'gemini-2.5-pro') {
  if (!process.env.GEMINI_API_KEY) throw new Error('Falta GEMINI_API_KEY');
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await client.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
  });
  const raw = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return parseJson(raw);
}
