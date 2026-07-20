import { createHash } from 'crypto';

export function verifyCatalogHash(catalog, expectedHash, stringify) {
  const serialized = stringify(catalog);
  const actualHash = createHash('sha256').update(serialized).digest('hex');
  if (actualHash !== expectedHash) throw new Error('Certified catalog hash mismatch');
  return catalog;
}

export async function withTransaction(pool, work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
