import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'module';
import { runExecutableFamilyIntegration } from './executable_family_integration_harness.mjs';

const require = createRequire(import.meta.url);
const catalog = require('../../catalog/versions/v1.0.0/executable_torque_manual.json');
const fixture = require('../../catalog/versions/v1.0.0/fixtures/torque_manual_real_anonymized.json');
test('TORQUE_MANUAL clasifica y renderiza el maestro certificado real', { timeout: 60000 }, async () => {
  await runExecutableFamilyIntegration({
    catalog, fixture, familyKey: 'TORQUE_MANUAL', endpointSlug: 'torque-manual',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    expectedToolName: 'TORQUE MANUAL',
    assertRendered(rendered) {
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
    },
  });
});
