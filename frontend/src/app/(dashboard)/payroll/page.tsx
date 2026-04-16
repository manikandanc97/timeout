import dynamic from 'next/dynamic';

const PayrollPageClient = dynamic(
  () => import('@/components/payroll/PayrollPageClient'),
  {
    loading: () => null,
  },
);

export default function PayrollPage() {
  return <PayrollPageClient />;
}
