import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import ExcelJS from 'exceljs';
import { createCertifiedGenerator } from './xls/certified_runtime.mjs';
import { selectCertifiedFamily } from './certified_family_selector.mjs';

async function loadWorkbook(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  return workbook;
}

function templateUrl(endpointSlug) {
  const baseUrl = process.env.TEMPLATE_BASE_URL;
  assert.ok(baseUrl, 'TEMPLATE_BASE_URL is required for real-byte integration');
  return `${baseUrl.replace(/\/$/, '')}/api/template/${endpointSlug}`;
}

async function downloadTemplate({ contract, endpointSlug, contentType }) {
  const response = await fetch(templateUrl(endpointSlug));
  const buffer = Buffer.from(await response.arrayBuffer());
  const errorBody = buffer.toString('utf8', 0, 2000);
  assert.equal(response.status, 200, `Template endpoint failed: ${response.status}\n${errorBody}`);
  const actualType = response.headers.get('content-type') || '';
  assert.doesNotMatch(actualType, /text\/html/i);
  assert.match(actualType, new RegExp(`^${contentType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:;|$)`, 'i'));
  assert.match(
    response.headers.get('content-disposition') || '',
    new RegExp(contract.template_reference.filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  );

  assert.equal(buffer.length, contract.template_reference.size_bytes);
  assert.equal(
    createHash('sha256').update(buffer).digest('hex'),
    contract.template_reference.sha256,
  );
  await loadWorkbook(buffer);
  return buffer;
}

export async function runExecutableFamilyIntegration(options) {
  const { catalog, fixture, familyKey, endpointSlug, contentType, expectedToolName, assertRendered } = options;
  const selected = selectCertifiedFamily(catalog, fixture);
  assert.equal(selected.key, familyKey);
  assert.equal(fixture.extraction.tool_name, expectedToolName);

  const downloadDriveFile = () => downloadTemplate({
    contract: selected.contract,
    endpointSlug,
    contentType,
  });
  const generate = createCertifiedGenerator({ downloadDriveFile, loadTemplateWorkbook: loadWorkbook });
  const output = await generate({
    report: fixture.report,
    extraction: fixture.extraction,
    renderContract: selected.contract,
  });
  const rendered = await loadWorkbook(output.buffer);
  await assertRendered(rendered);
}
