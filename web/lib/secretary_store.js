import { randomUUID } from 'crypto';
import { query } from './db.js';

let ready;

async function createSecretaryCatalog() {
  await query(`
    CREATE TABLE IF NOT EXISTS report_secretaries (
      id uuid PRIMARY KEY,
      name text NOT NULL,
      email text,
      active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

async function addTenantToReports() {
  await query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS tenant_id text`);
}

export async function ensureSecretarySchema() {
  if (ready) return ready;
  ready = Promise.all([createSecretaryCatalog(), addTenantToReports()]);
  return ready;
}

export async function listSecretaries({ activeOnly = false } = {}) {
  await ensureSecretarySchema();
  const where = activeOnly ? 'WHERE active=true' : '';
  const sql = `SELECT * FROM report_secretaries ${where} ORDER BY name`;
  return (await query(sql)).rows;
}

export async function createSecretary({ name, email }) {
  await ensureSecretarySchema();
  if (!name?.trim()) throw new Error('Nombre de secretaria requerido');

  const res = await query(
    `INSERT INTO report_secretaries (id, name, email)
     VALUES ($1, $2, $3) RETURNING *`,
    [randomUUID(), name.trim(), email?.trim() || null]
  );
  return res.rows[0];
}

export async function getActiveSecretary(id) {
  await ensureSecretarySchema();
  const res = await query(
    `SELECT * FROM report_secretaries WHERE id=$1 AND active=true`,
    [id]
  );
  return res.rows[0] || null;
}

export async function setSecretaryActive(id, active) {
  await ensureSecretarySchema();
  const res = await query(
    `UPDATE report_secretaries SET active=$2, updated_at=now()
     WHERE id=$1 RETURNING *`,
    [id, Boolean(active)]
  );
  return res.rows[0] || null;
}
