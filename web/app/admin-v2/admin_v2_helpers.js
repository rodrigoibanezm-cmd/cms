import { headers } from 'next/headers';
import { listReports } from '../../lib/report_reads.js';
import { requireRole, requireTenantAccess } from '../../lib/tenant_access.js';
import { authUserLabel } from '../../lib/tenant_store.js';
import { listAssignableUsers } from '../../lib/tenant_users.js';

const ADMIN_ROLES = ['admin', 'super_admin'];

function queryString(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null