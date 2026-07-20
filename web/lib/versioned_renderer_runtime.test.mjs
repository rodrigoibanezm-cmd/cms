import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'crypto';
import { createRequire } from 'module';
import { readFile } from 'fs/promises';
import { verifyCatalogHash, withTransaction } from './versioned_renderer_runtime.mjs';

const { stringify } = createRequire(import.meta.url)('../../catalog/compiler/compiler.js');

test('verifica catalog_hash con la serialización exacta del compilador', () => {
  const catalog = { families: { B: {}, A: {} }, schema_version: '1.0.0' };
  const hash = createHash('sha256').update(stringify(catalog)).digest('hex');
  assert.equal(verifyCatalogHash(catalog, hash, stringify), catalog);
  assert.throws(() => verifyCatalogHash(catalog, '0'.repeat(64), stringify), /catalog hash mismatch/i);
});

test('confirma las tres escrituras como una sola transacción', async () => {
  const calls = [];
  const client = { query: async (sql) => calls.push(sql), release: () => calls.push('RELEASE') };
  await withTransaction({ connect: async () => client }, async (tx) => {
    await tx.query('UPDATE reports');
    await tx.query('INSERT report_files');
    await tx.query('INSERT report_events');
  });
  assert.deepEqual(calls, ['BEGIN', 'UPDATE reports', 'INSERT report_files',
    'INSERT report_events', 'COMMIT', 'RELEASE']);
});

test('rollback evita commit ante una escritura fallida', async () => {
  const calls = [];
  const client = {
    query: async (sql) => {
      calls.push(sql);
      if (sql === 'INSERT report_files') throw new Error('db failure');
    },
    release: () => calls.push('RELEASE'),
  };
  await assert.rejects(() => withTransaction({ connect: async () => client }, async (tx) => {
    await tx.query('UPDATE reports');
    await tx.query('INSERT report_files');
  }), /db failure/);
  assert.deepEqual(calls, ['BEGIN', 'UPDATE reports', 'INSERT report_files', 'ROLLBACK', 'RELEASE']);
});

test('el adaptador consulta exactamente catalogVersionId y nunca estado active', async () => {
  const source = await readFile(new URL('./versioned_report_renderer.js', import.meta.url), 'utf8');
  assert.match(source, /FROM catalog_versions WHERE id=\$1/);
  assert.doesNotMatch(source, /status\s*=\s*['"]active['"]/i);
  assert.match(source, /verifyCatalogHash\(catalogVersion\.compiled_catalog/);
});
