import OperationFooter from '../../components/admin/OperationFooter.js';
import OperationHeader from '../../components/admin/OperationHeader.js';
import OperationSummary from '../../components/admin/OperationSummary.js';
import OperationTable from '../../components/admin/OperationTable.js';
import { listReports } from '../../lib/report_reads.js';
import { listTenants } from '../../lib/tenant_store.js';
import styles from './admin.module.css';

export const dynamic = 'force-dynamic';

function readFilters(params) {
  return {
    q: params?.q || '',
    state: params?.state || '',
    tenant_id: params?.tenant_id || '',
  };
}

export default async function AdminPage({ searchParams }) {
  const params = await searchParams;
  const filters = readFilters(params);
  const reports = await listReports(filters);
  const tenants = await listTenants({ activeOnly: true });
  const secretaries = tenants.filter((tenant) => tenant.mode === 'secretary');

  return (
    <main className={styles.adminScreen}>
      <OperationHeader filters={filters} />
      <OperationSummary reports={reports} />
      <OperationTable reports={reports} secretaries={secretaries} />
      <OperationFooter count={reports.length} />
    </main>
  );
}