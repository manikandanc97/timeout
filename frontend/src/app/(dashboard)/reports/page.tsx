import dynamic from 'next/dynamic';

const ReportsPageClient = dynamic(
  () => import('@/components/reports/ReportsPageClient'),
  {
    loading: () => null,
  },
);

export default function ReportsPage() {
  return <ReportsPageClient />;
}
