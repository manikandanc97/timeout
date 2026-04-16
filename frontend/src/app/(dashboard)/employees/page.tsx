import dynamic from 'next/dynamic';

const EmployeesPageClient = dynamic(() => import('./EmployeesPageClient'), {
  loading: () => null,
});

export default function EmployeesPage() {
  return <EmployeesPageClient />;
}
