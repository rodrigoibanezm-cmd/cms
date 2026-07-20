const CLAIM_SQL = `WITH next AS (
  SELECT id FROM catalog_reprocess_requests
  WHERE status='pending'
  ORDER BY created_at, id
  FOR UPDATE SKIP LOCKED
  LIMIT 1
)
UPDATE catalog_reprocess_requests request
SET status='processing', processing_started_at=now(), error_json=NULL
FROM next
WHERE request.id=next.id
RETURNING request.*`;

async function claimNext(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(CLAIM_SQL);
    await client.query('COMMIT');
    return result.rows[0] || null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

function assertTransition(result, target, cause) {
  if (result.rowCount === 1) return;
  throw new Error(`Catalog reprocess request transition to ${target} failed`, { cause });
}

async function complete(pool, request, result) {
  const update = await pool.query(`UPDATE catalog_reprocess_requests
    SET status='completed', completed_at=now(), result_json=$2, error_json=NULL
    WHERE id=$1 AND status='processing'`, [request.id, JSON.stringify(result)]);
  assertTransition(update, 'completed');
}

async function fail(pool, request, error) {
  const payload = { name: error?.name || 'Error', message: error?.message || String(error) };
  const update = await pool.query(`UPDATE catalog_reprocess_requests
    SET status='failed', failed_at=now(), error_json=$2
    WHERE id=$1 AND status='processing'`, [request.id, JSON.stringify(payload)]);
  assertTransition(update, 'failed', error);
}

export function createCatalogReprocessWorker({ pool, renderReport }) {
  return async function processNextCatalogReprocessRequest() {
    const request = await claimNext(pool);
    if (!request) return null;
    let result;
    try {
      result = await renderReport({
        reportId: request.report_id,
        catalogVersionId: request.catalog_version_id,
      });
    } catch (error) {
      await fail(pool, request, error);
      throw error;
    }
    await complete(pool, request, result);
    return { requestId: request.id, status: 'completed', result };
  };
}

export { CLAIM_SQL };
