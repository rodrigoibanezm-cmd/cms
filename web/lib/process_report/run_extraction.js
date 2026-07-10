import fs from 'fs';
import os from 'os';
import path from 'path';
import { runExtraction } from '../process_pipeline.js';

function repoRoot() {
  if (path.basename(process.cwd()) === 'web') {
    return path.resolve(process.cwd(), '..');
  }
  return process.cwd();
}

function fullPath(relativePath) {
  return path.join(repoRoot(), relativePath);
}

function textFile(relativePath) {
  return fs.readFileSync(fullPath(relativePath), 'utf8');
}

function jsonFile(relativePath) {
  return JSON.parse(textFile(relativePath));
}

function optionalJsonFile(relativePath) {
  const target = fullPath(relativePath);
  return fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, 'utf8')) : [];
}

function catalogWithCustomBases() {
  return [
    ...optionalJsonFile('benchmark/catalog/custom_bases.json'),
    ...jsonFile('benchmark/catalog/family_catalog.json'),
  ];
}

function safePart(value) {
  const clean = String(value || 'SIN_OT')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/^_+|_+$/g, '');
  return clean || 'SIN_OT';
}

export async function runReportExtraction({ image, otHint, sourceName, reportId }) {
  return runExtraction({
    image,
    otHint,
    sourceName,
    targetDir: path.join(os.tmpdir(), 'cms-extractions', safePart(otHint || reportId)),
    promptPass1: textFile('benchmark/prompts/extract_pass1.md'),
    promptPass2Template: textFile('benchmark/prompts/extract_pass2.md'),
    catalog: catalogWithCustomBases(),
  });
}