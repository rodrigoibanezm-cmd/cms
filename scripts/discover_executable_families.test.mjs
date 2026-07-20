import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { discoverExecutableFamilies } from './discover_executable_families.mjs';

function register(root, id, family = id.toUpperCase()) {
  const catalogDir = path.join(root, 'catalog/versions/v1.0.0');
  const testDir = path.join(root, 'web/lib');
  mkdirSync(catalogDir, { recursive: true });
  mkdirSync(testDir, { recursive: true });
  writeFileSync(path.join(catalogDir, `executable_${id}.json`), JSON.stringify({ families: { [family]: {} } }));
  writeFileSync(path.join(testDir, `executable_${id}.integration.test.mjs`), '');
}

test('descubre una cuarta familia registrada sin configurar el workflow', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'executable-families-'));
  register(root, 'future_family');
  assert.deepEqual(discoverExecutableFamilies(root), [{
    family: 'FUTURE_FAMILY', id: 'future_family', slug: 'future-family',
    test: 'web/lib/executable_future_family.integration.test.mjs',
  }]);
});

test('rechaza una familia sin integración real-byte', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'executable-families-'));
  register(root, 'incomplete');
  unlinkSync(path.join(root, 'web/lib/executable_incomplete.integration.test.mjs'));
  assert.throws(() => discoverExecutableFamilies(root), /is missing/);
});
