import "dotenv/config";
import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const imagePath = process.argv[2];
const ot = process.argv[3] || "test";
const targetDir = process.argv[4] || "benchmark/results";

if (!imagePath) {
  console.error("Uso: node benchmark/scripts/run_extract.js <imagen.jpg> <ot> <carpeta_destino>");
  process.exit(1);
}

const promptPass1 = fs.readFileSync(
  path.join(process.cwd(), "benchmark/prompts/extract_pass1.md"),
  "utf8"
);

const promptPass2Template = fs.readFileSync(
  path.join(process.cwd(), "benchmark/prompts/extract_pass2.md"),
  "utf8"
);

function imageToBase64(filePath) {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mediaType = ext === ".png" ? "image/png" : "image/jpeg";

  return {
    base64: buffer.toString("base64"),
    mediaType
  };
}

function parseJson(raw) {
  try {
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    return {
      _raw: raw,
      _parse_error: true
    };
  }
}

function saveJson(name, data) {
  fs.mkdirSync(targetDir, { recursive: true });

  const outPath = path.join(targetDir, `${ot}_${name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");

  console.log(`OK ${name}: ${outPath}`);
  return data;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callGemini(model, prompt, image, retries = 4) {
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
                  data: image.base64
                }
              }
            ]
          }
        ]
      });

      return response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (err) {
      const status = err?.status || err?.code;
      const retryable = status === 429 || status === 500 || status === 503;

      if (!retryable || attempt === retries) {
        throw err;
      }

      const waitMs = attempt * 7000;
      console.warn(
        `Gemini ${model} falló (${status}). Reintento ${attempt}/${retries} en ${waitMs / 1000}s...`
      );

      await sleep(waitMs);
    }
  }

  throw new Error(`Gemini ${model} falló sin respuesta`);
}

async function main() {
  const image = imageToBase64(imagePath);

  console.log("Pasada 1 (Flash)...");
  const raw1 = await callGemini("gemini-2.5-flash", promptPass1, image);
  const pass1 = parseJson(raw1);
  saveJson("pass1", pass1);

  const familia = pass1.familia || "VARIOS";
  console.log(`Familia detectada: ${familia}`);

  console.log("Pasada 2 (Pro)...");
  const promptPass2 = promptPass2Template.replace("{{FAMILIA}}", familia);
  const raw2 = await callGemini("gemini-2.5-pro", promptPass2, image);
  const pass2 = parseJson(raw2);

  const final = {
    ...pass1,
    inspeccion: pass2.inspeccion || []
  };

  saveJson("gemini", final);

  console.log("\n--- RESULTADO FINAL ---");
  console.log(JSON.stringify(final, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
