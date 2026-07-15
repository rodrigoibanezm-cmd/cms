import AdminV2View from '../../components/admin-v2/AdminV2View.js';
import { loadAdminV2Data } from '../../helpers/admin_v2_helpers.js';

export const dynamic = 'force-dynamic';

export default async function AdminV2Page({ searchParams }) {
  const params = await searchParams;
  const data = await loadAdminV2Data(params);

  return <AdminV2View {...data} />;
}
