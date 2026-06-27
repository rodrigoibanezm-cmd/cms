import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const pdfPath = process.argv[2];
const outPath = process.argv[3];

if (!pdfPath || !outPath) {
  console.error("Uso: node benchmark/scripts/pdf_to_images.js <input.pdf> <output.jpg>");
  process.exit(1);
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });

const pyScript = path.join("benchmark", "scripts", "pdf_to_image.py");
const result = spawnSync("python", [pyScript, pdfPath, outPath], { stdio: "inherit" });

if (result.status !== 0) process.exit(result.status || 1);
console.log(`OK: ${outPath}`);
