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

async function complete(pool, request, result) {
  await pool.query(`UPDATE catalog_reprocess_requests
    SET status='completed', completed_at=now(), result_json=$2, error_json=NULL
    WHERE id=$1 AND status='processing'`, [request.id, JSON.stringify(result)]);
}

async function fail(pool, request, error) {
  const payload = { name: error?.name || 'Error', message: error?.message || String(error) };
  await pool.query(`UPDATE catalog_reprocess_requests
    SET status='failed', failed_at=now(), error_json=$2
    WHERE id=$1 AND status='processing'`, [request.id, JSON.stringify(payload)]);
}

export function createCatalogReprocessWorker({ pool, renderReport }) {
  return async function processNextCatalogReprocessRequest() {
    const request = await claimNext(pool);
    if (!request) return null;
    try {
      const result = await renderReport({
        reportId: request.report_id,
        catalogVersionId: request.catalog_version_id,
      });
      await complete(pool, request, result);
      return { requestId: request.id, status: 'completed', result };
    } catch (error) {
      await fail(pool, request, error);
      throw error;
    }
  };
}

export { CLAIM_SQL };
