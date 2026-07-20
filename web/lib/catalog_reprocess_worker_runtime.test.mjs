import test from 'node:test';
import assert from 'node:assert/strict';
import { CLAIM_SQL, createCatalogReprocessWorker } from './catalog_reprocess_worker_runtime.mjs';

function poolWithClaim(request, rowCounts = []) {
  const calls = [];
  const client = {
    query: async (sql) => {
      calls.push(sql);
      if (sql.includes('RETURNING request.*')) return { rows: request ? [request] : [] };
      return { rows: [] };
    },
    release: () => calls.push('RELEASE'),
  };
  return {
    calls,
    connect: async () => client,
    query: async (sql, params) => {
      calls.push([sql, params]);
      return { rows: [], rowCount: rowCounts.length ? rowCounts.shift() : 1 };
    },
  };
}

function request(id = 'request-1') {
  return { id, report_id: 'report-1', catalog_version_id: 'catalog-1' };
}

test('claim es atómico y evita filas ya bloqueadas', () => {
  assert.match(CLAIM_SQL, /FOR UPDATE SKIP LOCKED/);
  assert.match(CLAIM_SQL, /status='pending'/);
  assert.match(CLAIM_SQL, /SET status='processing'/);
});

test('retorna null cuando no hay solicitudes pendientes', async () => {
  const pool = poolWithClaim(null);
  const processNext = createCatalogReprocessWorker({ pool, renderReport: async () => {} });
  assert.equal(await processNext(), null);
  assert.deepEqual(pool.calls.slice(0, 3), ['BEGIN', CLAIM_SQL, 'COMMIT']);
});

test('usa exclusivamente los IDs almacenados y completa', async () => {
  const pool = poolWithClaim(request());
  let received;
  const processNext = createCatalogReprocessWorker({
    pool,
    renderReport: async (input) => { received = input; return { family: 'LUMINARIA' }; },
  });
  const result = await processNext();
  assert.deepEqual(received, { reportId: 'report-1', catalogVersionId: 'catalog-1' });
  assert.equal(result.status, 'completed');
  assert.match(pool.calls.at(-1)[0], /status='completed'/);
});

test('persiste failed antes de propagar el error', async () => {
  const pool = poolWithClaim(request('request-2'));
  const processNext = createCatalogReprocessWorker({
    pool,
    renderReport: async () => { throw new Error('render failed'); },
  });
  await assert.rejects(() => processNext(), /render failed/);
  const failure = pool.calls.at(-1);
  assert.match(failure[0], /status='failed'/);
  assert.match(failure[1][1], /render failed/);
});

test('completed con rowCount cero falla', async () => {
  const pool = poolWithClaim(request('request-3'), [0]);
  const processNext = createCatalogReprocessWorker({
    pool,
    renderReport: async () => ({ family: 'LUMINARIA' }),
  });
  await assert.rejects(() => processNext(), /transition to completed failed/);
});

test('failed con rowCount cero preserva el error original como causa', async () => {
  const pool = poolWithClaim(request('request-4'), [0]);
  const processNext = createCatalogReprocessWorker({
    pool,
    renderReport: async () => { throw new Error('render failed'); },
  });
  await assert.rejects(() => processNext(), (error) => {
    assert.match(error.message, /transition to failed failed/);
    assert.equal(error.cause?.message, 'render failed');
    return true;
  });
});
