import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'module';
import { runExecutableFamilyIntegration } from './executable_family_integration_harness.mjs';

const require = createRequire(import.meta.url);
const catalog = require('../../catalog/versions/v1.0.0/executable_luminaria.json');
const fixture = require('../../catalog/versions/v1.0.0/fixtures/luminaria_real_anonymized.json');
test('LUMINARIA clasifica y renderiza el maestro certificado real', { timeout: 60000 }, async () => {
  await runExecutableFamilyIntegration({
    catalog, fixture, familyKey: 'LUMINARIA', endpointSlug: 'luminaria',
    contentType: 'application/vnd.ms-excel.sheet.macroenabled.12', expectedToolName: 'TRIPODE',
    assertRendered(rendered) {
      assert.equal(rendered.worksheets.length, 2);
      const sheet = rendered.worksheets[0];
      assert.equal(sheet.getCell('D7').value, 'MILWAUKEE');
      assert.equal(sheet.getCell('D8').value, '2130-20');
      assert.equal(sheet.getCell('I9').value, 'LUM-ANON-001');
      assert.equal(sheet.getCell('A5').value, ' INFORME TÉCNICO LUMINARIA INALÁMBRICA');
      assert.equal(sheet.getCell('C20').value, 'DESCRIPCIÓN');
      assert.equal(sheet.getCell('C21').value, 'ESTRUCTURA PRINCIPAL');
      assert.equal(rendered.worksheets[1].getCell('A4').value, 'REGISTRO FOTOGRAFICO');
    },
  });
});
