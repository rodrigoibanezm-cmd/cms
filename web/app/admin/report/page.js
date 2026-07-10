import { headers } from 'next/headers';
import AssignSecretaryForm from '../../../components/admin/AssignSecretaryForm.js';
import { AuditPanel, CriticalBox } from '../../../components/admin/ReviewAuditPanel.js';
import { VisualFile, XlsPanel } from '../../../components/admin/ReviewVisualPanel.js';
import SecretaryApproveForm from '../../../components/admin/SecretaryApproveForm.js';
import TemplateChangeForm from '../../../components/admin/TemplateChangeForm.js';
import { workflowLabel } from '../../../components/admin/admin_helpers.js';
import { listTemplates } from '../../../lib/template_catalog.js';
import { getReport } from '../../../lib/report_reads.js';
import { requireRole, requireTenantAccess } from '../../../lib/tenant_access.js';
import { listAssignableUsers } from '../../../lib/tenant_users.js';
import styles from './review.module.css';

export const dynamic = 'force-dynamic';
const ADMIN_ROLES = ['admin', 'super_admin'];
const DETAIL_ROLES = [...ADMIN_ROLES, 'administrativa', 'secretary'];
const QUEUE_ROLES = ['administrativa', 'secretary'];

function filesOf(files, kind) {
  return files.filter((file) => file.kind === kind);
}

function confidenceLabel(report) {
  if (report.confidence_score === null || report.confidence_score === undefined) return 'Confianza IA: -';
  return `Confianza IA: ${report.confidence_score}%`;
}

function queryString(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null) search.set(key, value);
  }
  return search.toString();
}

async function requireDetailAccess(params) {
  const qs = queryString(params);
  const request = { headers: await headers(), url: `http://local/admin/report${qs ? `?${qs}` : ''}` };
  return requireRole(await requireTenantAccess(request), DETAIL_ROLES);
}

function backUrl(token, access) {
  const path = QUEUE_ROLES.includes(access?.role) ? '/admin/secretary' : '/admin';
  return token ? `${path}?token=${encodeURIComponent(token)}` : path;
}

function withToken(path, token) {
  return token ? `${path}${path.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}` : path;
}

function canManageAssignments(access) {
  return ADMIN_ROLES.includes(access?.role);
}

export default async function AdminReportPage({ searchParams }) {
  const params = await searchParams;
  const access = await requireDetailAccess(params);
  const id = params?.id;
  const token = params?.token || '';
  const data = id ? await getReport(id, access) : { report: null, files: [], events: [] };
  const report = data.report;
  const back = backUrl(token, access);

  if (!report) {
    return <main className={styles.reviewScreen}><a className={styles.backLink} href={back}>Volver</a><p>Reporte no encontrado.</p></main>;
  }

  const originals = filesOf(data.files, 'original_report');
  const photos = filesOf(data.files, 'detail_photo');
  const xlsFiles = filesOf(data.files, 'generated_xls');
  const templates = await listTemplates().catch(() => []);
  const secretaries = canManageAssignments(access) ? await listAssignableUsers(access.tenantId).catch(() => []) : [];

  return (
    <main className={styles.reviewScreen}>
      <header className={styles.reviewHeader}>
        <a className={styles.backLink} href={back}>Volver</a>
        <div className={styles.reviewTopBar}>
          <div><h1>Revision OT {report.ot || '-'}</h1><div className={styles.reviewMeta}><span>{workflowLabel(report.current_state)}</span><span>{confidenceLabel(report)}</span></div></div>
          <div className={styles.approveGroup}>
            {canManageAssignments(access) ? <AssignSecretaryForm report={report} secretaries={secretaries} action={withToken('/api/admin/reports/assign', token)} returnTo={withToken(`/admin/report?id=${report.id}`, token)} /> : null}
            <TemplateChangeForm report={report} token={token} templates={templates} />
            <SecretaryApproveForm report={report} token={token} />
          </div>
        </div>
      </header>
      <CriticalBox audit={data.audit} report={report} />
      <div className={styles.reviewMainGrid}>
        <VisualFile title="Informe original" files={originals} token={token} />
        <XlsPanel report={report} files={xlsFiles} />
      </div>
      <div className={styles.reviewSecondaryGrid}>
        <VisualFile title="Fotos detalle" files={photos} token={token} />
        <AuditPanel audit={data.audit} events={data.events || []} />
      </div>
    </main>
  );
}
