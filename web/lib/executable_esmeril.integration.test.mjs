import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'module';
import { runExecutableFamilyIntegration } from './executable_family_integration_harness.mjs';

const require = createRequire(import.meta.url);
const catalog = require('../../catalog/versions/v1.0.0/executable_esmeril.json');
const fixture = require('../../catalog/versions/v1.0.0/fixtures/esmeril_real_anonymized.json');
test('ESMERIL clasifica y renderiza el maestro certificado real', { timeout: 60000 }, async () => {
  await runExecutableFamilyIntegration({
    catalog, fixture, familyKey: 'ESMERIL', endpointSlug: 'esmeril',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    expectedToolName: 'PULIDOR INALAMBRICO',
    assertRendered(rendered) {
      assert.equal(rendered.worksheets.length, 2);
      const sheet = rendered.worksheets[0];
      assert.equal(sheet.getCell('D8').value, 'MILWAUKEE');
      assert.equal(sheet.getCell('D9').value, '2738-20');
      assert.equal(sheet.getCell('I11').value, 'ESM-ANON-001');
      assert.equal(sheet.getCell('A6').value, ' INFORME TECNICO ESMERIL ELECTRICO 7"');
      assert.equal(sheet.getCell('C23').value, 'DESCRIPCIÓN');
      assert.equal(sheet.getCell('C24').value, 'ESTRUCTURA PRINCIPAL');
      assert.equal(rendered.worksheets[1].getCell('A7').value, ' INFORME FOTOGRAFICO');
    },
  });
});
