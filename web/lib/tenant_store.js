import { randomUUID } from 'crypto';
import { query } from './db.js';

let ready;
const MODES = ['super_admin', 'admin', 'secretary', 'dashboard'];

async function createTenantCatalog() {
  await query(`CREATE TABLE IF NOT EXISTS report_tenants (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    email text,
    mode text NOT NULL DEFAULT 'secretary',
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`);
}

async function addTenantToReports() {
  await query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS tenant_id text`);
}

export async function ensureTenantSchema() {
  if (ready) return ready;
  ready = Promise.all([createTenantCatalog(), addTenantToReports()]);
  return ready;
}

function cleanMode(mode) {
  return MODES.includes(mode) ? mode : 'secretary';
}

export async function listTenants({ activeOnly = false, mode } = {}) {
  await ensureTenantSchema();
  const filters = [];
  const params = [];
  if (activeOnly) filters.push('active=true');
  if (mode) {
    params.push(cleanMode(mode));
    filters.push(`mode=$${params.length}`);
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  return (await query(`SELECT * FROM report_tenants ${where} ORDER BY name`, params)).rows;
}

export async function createTenant({ name, email, mode }) {
  await ensureTenantSchema();
  if (!name?.trim()) throw new Error('Nombre de usuario requerido');
  const res = await query(
    `INSERT INTO report_tenants (id, name, email, mode)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [randomUUID(), name.trim(), email?.trim() || null, cleanMode(mode)]
  );
  return res.rows[0];
}

export async function getActiveTenant(id, mode) {
  await ensureTenantSchema();
  const params = [id];
  const modeSql = mode ? 'AND mode=$2' : '';
  if (mode) params.push(cleanMode(mode));
  const res = await query(
    `SELECT * FROM report_tenants WHERE id=$1 AND active=true ${modeSql}`,
    params
  );
  return res.rows[0] || null;
}

export async function setTenantActive(id, active) {
  await ensureTenantSchema();
  const res = await query(
    `UPDATE report_tenants SET active=$2, updated_at=now()
     WHERE id=$1 RETURNING *`,
    [id, Boolean(active)]
  );
  return res.rows[0] || null;
}

export async function deleteTenant(id) {
  await ensureTenantSchema();
  await query(`UPDATE reports SET tenant_id=NULL WHERE tenant_id=$1`, [id]);
  const res = await query(`DELETE FROM report_tenants WHERE id=$1 RETURNING *`, [id]);
  return res.rows[0] || null;
}
