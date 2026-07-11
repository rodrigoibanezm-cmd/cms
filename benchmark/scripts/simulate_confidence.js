import fs from "fs";
import { calcularConfianza, scoreToSemaforo } from "../lib/confidence.js";

const source = process.argv[2];
if (!source) throw new Error("Uso: node benchmark/scripts/simulate_confidence.js extraccion.json");
const data = JSON.parse(fs.readFileSync(source, "utf8"));
const pass1 = data.pass1 || data.extraction_json || data;
const result = calcularConfianza({
  pass1,
  decision: data.decision || pass1.decision,
  inspeccion: data.inspeccion || pass1.inspeccion || [],
});
console.table(result.breakdown);
console.log(JSON.stringify({
  score: result.score,
  semaforo: scoreToSemaforo(result.score),
  version: result.version,
}, null, 2));
