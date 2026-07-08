import { createHash, randomBytes } from 'crypto';
import { query } from './db.js';
import { ensureReportSchema } from './report_schema.js';

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function randomToken() {
  return randomBytes(32).toString('base64url');
}

export async function issueTenantAccessToken({ tenantId, userId, role }) {
  if (!tenantId) throw new Error('tenantId requerido');
  if (!userId) throw new Error('userId requerido');
  if (!role) throw new Error('role requerido');
  await ensureReportSchema();

  const token = randomToken();
  await query(
    `INSERT INTO tenant_access_tokens
      (tenant_id, role, user_id, token_hash, active)
     VALUES ($1, $2, $3, $4, true)`,
    [tenantId, role, userId, hashToken(token)]
  );
  return token;
}

export function pathForRole(role) {
  if (role === 'dashboard') return '/dashboard';
  if (role === 'super_admin') return '/config';
  if (role === 'admin') return '/admin';
  return '/admin/secretary';
}

export function tokenLinkForRole(role, token) {
  return `${pathForRole(role)}?token=${encodeURIComponent(token)}`;
}
