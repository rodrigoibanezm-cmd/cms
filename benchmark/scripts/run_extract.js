import "dotenv/config";
import { imageToBase64, readJson, readText } from "../lib/io.js";
import { runExtraction } from "../lib/extraction_pipeline.js";

const imagePath = process.argv[2];
const ot = process.argv[3] || "test";
const targetDir = process.argv[4] || "benchmark/results";

if (!imagePath) {
  console.error(
    "Uso: node benchmark/scripts/run_extract.js <imagen.jpg> <ot> <carpeta_destino>"
  );
  process.exit(1);
}

const promptPass1 = readText("benchmark/prompts/extract_pass1.md");
const promptPass2Template = readText("benchmark/prompts/extract_pass2.md");
const catalog = readJson("benchmark/catalog/family_catalog.json");
const image = imageToBase64(imagePath);

runExtraction({
  image,
  ot,
  targetDir,
  promptPass1,
  promptPass2Template,
  catalog,
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
