import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage({ searchParams }) {
  const params = await searchParams;
  const suffix = params?.id ? `?id=${params.id}` : '';
  redirect(`/dashboard${suffix}`);
}
