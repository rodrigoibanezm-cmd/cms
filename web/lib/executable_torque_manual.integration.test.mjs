import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import ExcelJS from 'exceljs';
import { createRequire } from 'module';
import { createCertifiedGenerator } from './xls/certified_runtime.mjs';
import { selectCertifiedFamily } from './certified_family_selector.mjs';

const require = createRequire(import.meta.url);
const catalog = require('../../catalog/versions/v1.0.0/executable_torque_manual.json');
const fixture = require('../../catalog/versions/v1.0.0/fixtures/torque_manual_real_anonymized.json');
const TEMPLATE_URL = process.env.TORQUE_MANUAL_TEMPLATE_URL
  || 'https://cms-git-feat-operational-catalog-v1-rodrigo-qrs-chile-s-projects.vercel.app/api/template/torque-manual';

async function downloadDriveFile() {
  const response = await fetch(TEMPLATE_URL);
  assert.equal(response.status, 200, `Template endpoint failed: ${response.status}`);
  assert.doesNotMatch(response.headers.get('content-type') || '', /text\/html/i);
  assert.match(response.headers.get('content-disposition') || '', /TORQUE_MANUAL_FINAL\.xlsx/);
  const buffer = Buffer.from(await response.arrayBuffer());
  assert.equal(buffer.length, 121247);
  assert.equal(createHash('sha256').update(buffer).digest('hex'), catalog.families.TORQUE_MANUAL.template_reference.sha256);
  return buffer;
}

async function loadTemplateWorkbook(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  return workbook;
}

test('TORQUE_MANUAL clasifica y renderiza el maestro certificado real', { timeout: 60000 }, async () => {
  const selected = selectCertifiedFamily(catalog, fixture);
  assert.equal(selected.key, 'TORQUE_MANUAL');
  assert.equal(fixture.extraction.tool_name, 'TORQUE MANUAL');

  const generate = createCertifiedGenerator({ downloadDriveFile, loadTemplateWorkbook });
  const output = await generate({
    report: fixture.report,
    extraction: fixture.extraction,
    renderContract: selected.contract,
  });

  const rendered = await loadTemplateWorkbook(output.buffer);
  assert.equal(rendered.worksheets.length, 2);
  const sheet = rendered.worksheets[0];
  assert.equal(sheet.getCell('D7').value, 'PROTO');
  assert.equal(sheet.getCell('D8').value, '6012C');
  assert.equal(sheet.getCell('I10').value, 'TM-ANON-001');

  assert.equal(sheet.getCell('A5').value, ' INFORME TÉCNICO TORQUE MANUAL');
  assert.equal(sheet.getCell('C20').value, 'DESCRIPCIÓN');
  assert.equal(sheet.getCell('C21').value, 'ESTRUCTURA  PRICIPAL');
  assert.equal(sheet.getCell('C22').value, 'SISTEMA DE TRINQUETE');
  assert.equal(rendered.worksheets[1].getCell('A3').value, 'REGISTRO FOTOGRÁFICO');
});
