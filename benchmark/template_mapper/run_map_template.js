import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { inspectTemplate } from './inspect_template.js';
import { callMapper } from './mapper_client.js';
import { validateTemplateMap } from './validate_map.js';

function usage() {
  console.error('Uso: node benchmark/template_mapper/run_map_template.js <plantilla.xlsx> <template_key> [out_dir]');
  process.exit(1);
}

function readPrompt(templateJson) {
  const promptPath = 'benchmark/template_mapper/prompt_map_template.md';
  const prompt = fs.readFileSync(path.join(process.cwd(), promptPath), 'utf8');
  return prompt.replace('{{TEMPLATE_JSON}}', JSON.stringify(templateJson, null, 2));
}

async function main() {
  const templatePath = process.argv[2];
  const templateKey = process.argv[3];
  const outDir = process.argv[4] || 'benchmark/template_mapper/maps';
  if (!templatePath || !templateKey) usage();

  console.log(`Inspeccionando: ${templatePath}`);
  const inspected = await inspectTemplate(templatePath);
  inspected.template_key = templateKey;

  console.log('Generando mapa con LLM...');
  const prompt = readPrompt(inspected);
  const map = await callMapper(prompt);
  map.template_key = map.template_key || templateKey;

  const errors = validateTemplateMap(map);
  fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, `${templateKey}.json`);
  fs.writeFileSync(outPath, JSON.stringify(map, null, 2), 'utf8');
  console.log(`Mapa: ${outPath}`);

  if (errors.length) {
    const errPath = path.join(outDir, `${templateKey}.errors.json`);
    fs.writeFileSync(errPath, JSON.stringify(errors, null, 2), 'utf8');
    console.warn(`Validación con alertas: ${errPath}`);
    process.exitCode = 2;
  } else {
    console.log('Validación OK');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
