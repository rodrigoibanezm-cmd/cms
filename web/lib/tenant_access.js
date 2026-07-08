import { createHash } from 'crypto';
import { query } from './db.js';
import { ensureReportSchema } from './report_schema.js';

export class TenantAccessError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function tokenFromAuthorization(value) {
  if (!value) return null;
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

function readHeader(req, name) {
  return req.headers?.get?.(name) || req.headers?.[name] || null;
}

function readQueryToken(req) {
  const url = req.nextUrl || new URL(req.url);
  return url.searchParams.get('token') || url.searchParams.get('tenant_token');
}

function readToken(req) {
  return (
    readQueryToken(req) ||
    readHeader(req, 'x-tenant-token') ||
    tokenFromAuthorization(readHeader(req, 'authorization'))
  );
}

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

async function findAccess(tokenHash) {
  const res = await query(
    `SELECT tenant_id, role, user_id
     FROM tenant_access_tokens
     WHERE token_hash = $1
       AND active = true
       AND (expires_at IS NULL OR expires_at > now())
     LIMIT 1`,
    [tokenHash]
  );
  return res.rows[0] || null;
}

export async function requireTenantAccess(req) {
  await ensureReportSchema();
  const token = readToken(req);
  if (!token) throw new TenantAccessError(401, 'Falta token de tenant');

  const tokenHash = hashToken(token);
  const access = await findAccess(tokenHash);
  if (!access) throw new TenantAccessError(403, 'Token de tenant inválido');

  await query(
    `UPDATE tenant_access_tokens SET last_used_at = now() WHERE token_hash = $1`,
    [tokenHash]
  );

  return {
    tenantId: access.tenant_id,
    role: access.role,
    userId: access.user_id,
  };
}
