import "dotenv/config";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const imagePath = process.argv[2];
const ot = process.argv[3] || "test";

if (!imagePath) {
  console.error("Uso: node benchmark/scripts/run_openai.js <ruta_imagen> <ot>");
  process.exit(1);
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const prompt = `
Eres un extractor de datos desde formularios técnicos manuscritos.

Devuelve SOLO JSON válido.
No inventes datos.
Si no puedes leer un campo, usa null.

Campos:
- ot
- cliente
- area_usuaria
- marca
- modelo
- serie
- rotulo
- tecnico
- fecha
- estado
- inspeccion_visual
- prueba_funcionamiento
- reparacion

Formato:
{
  "ot": null,
  "cliente": null,
  "area_usuaria": null,
  "marca": null,
  "modelo": null,
  "serie": null,
  "rotulo": null,
  "tecnico": null,
  "fecha": null,
  "estado": null,
  "inspeccion_visual": null,
  "prueba_funcionamiento": null,
  "reparacion": null
}
`;

function imageToBase64(filePath) {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase().replace(".", "");
  const mime = ext === "png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

async function main() {
  const imageUrl = imageToBase64(imagePath);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      }
    ]
  });

  const text = response.choices[0].message.content;

  const outDir = "benchmark/results/openai";
  fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, `${ot}.json`);
  fs.writeFileSync(outPath, text, "utf8");

  console.log(`OK: ${outPath}`);
  console.log(text);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
