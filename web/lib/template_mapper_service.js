import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { GoogleGenAI } from '@google/genai';
import { inspectTemplateBuffer } from './template_inspector.js';
import { validateTemplateMap } from './template_map_validator.js';

function env(name) {
  return process.env[name] || '';
}

function repoRoot() {
  return path.basename(process.cwd()) === 'web' ? path.resolve(process.cwd(), '..') : process.cwd();
}

function parseServiceAccount() {
  const raw = env('GOOGLE_SERVICE_ACCOUNT_JSON');
  if (!raw) throw new Error('Falta GOOGLE_SERVICE_ACCOUNT_JSON');
  return JSON.parse(raw);
}

function auth() {
  const clientId = env('GOOGLE_CLIENT_ID');
  const clientSecret = env('GOOGLE_CLIENT_SECRET');
  const refreshToken = env('GOOGLE_REFRESH_TOKEN');
  if (clientId && clientSecret && refreshToken) {
    const client = new google.auth.OAuth2(clientId, clientSecret);
    client.setCredentials({ refresh_token: refreshToken });
    return client;
  }
  return new google.auth.GoogleAuth({ credentials: parseServiceAccount(), scopes: ['https://www.googleapis.com/auth/drive'] });
}

function drive() {
  return google.drive({ version: 'v3', auth: auth() });
}

async function findTemplateByName(filename) {
  const folderId = env('GOOGLE_DRIVE_TEMPLATES_FOLDER_ID') || env('BASES_FOLDER_ID');
  if (!folderId) throw new Error('Falta carpeta de plantillas');
  const safeName = filename.replace(/'/g, "\\'");
  const res = await drive().files.list({
    q: `'${folderId}' in parents and name='${safeName}' and trashed=false`,
    fields: 'files(id,name)',
    pageSize: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  return res.data.files?.[0] || null;
}

async function downloadDriveFile(fileId) {
  const res = await drive().files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(res.data);
}

function buildPrompt(templateJson) {
  const promptPath = path.join(repoRoot(), 'benchmark/template_mapper/prompt_map_template.md');
  const prompt = fs.readFileSync(promptPath, 'utf8');
  return prompt.replace('{{TEMPLATE_JSON}}', JSON.stringify(templateJson, null, 2));
}

function parseModelJson(raw) {
  return JSON.parse(String(raw).replace(/```json|```/g, '').trim());
}

async function callMapper(prompt, model) {
  if (!env('GEMINI_API_KEY')) throw new Error('Falta GEMINI_API_KEY');
  const client = new GoogleGenAI({ apiKey: env('GEMINI_API_KEY') });
  const response = await client.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
  });
  const raw = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return parseModelJson(raw);
}

export async function generateTemplateMap({ fileId, templateFilename, templateKey, model = 'gemini-2.5-pro' }) {
  if (!templateKey) throw new Error('Falta templateKey');
  let source = { id: fileId || null, name: templateFilename || null };
  if (!source.id) {
    if (!templateFilename) throw new Error('Falta fileId o templateFilename');
    const file = await findTemplateByName(templateFilename);
    if (!file) throw new Error(`Plantilla no encontrada: ${templateFilename}`);
    source = file;
  }

  const buffer = await downloadDriveFile(source.id);
  const inspected = await inspectTemplateBuffer(buffer);
  inspected.template_key = templateKey;
  inspected.template_filename = source.name;

  const map = await callMapper(buildPrompt(inspected), model);
  map.template_key = map.template_key || templateKey;
  map.template_filename = map.template_filename || source.name;

  return { map, validation_errors: validateTemplateMap(map), inspected };
}
