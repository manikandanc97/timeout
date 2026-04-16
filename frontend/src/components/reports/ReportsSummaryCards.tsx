import KpiCardGrid from '@/components/common/KpiCardGrid';

type ReportsSummaryCardsProps = {
  totalEmployees: number;
  employeesOnLeave: number;
  totalSalaryPaid: string;
  pendingRequests: number;
  newJoiners: number;
};

export default function ReportsSummaryCards(props: ReportsSummaryCardsProps) {
  const items = [
    { key: 'totalEmployees', label: 'Total Employees', value: String(props.totalEmployees), accent: 'border-l-sky-400' },
    { key: 'employeesOnLeave', label: 'Employees On Leave', value: String(props.employeesOnLeave), accent: 'border-l-amber-400' },
    { key: 'totalSalaryPaid', label: 'Total Salary Paid', value: props.totalSalaryPaid, accent: 'border-l-emerald-400' },
    { key: 'pendingRequests', label: 'Pending Requests', value: String(props.pendingRequests), accent: 'border-l-violet-400' },
    { key: 'newJoiners', label: 'New Joiners', value: String(props.newJoiners), accent: 'border-l-indigo-400' },
  ];

  return <KpiCardGrid items={items} ariaLabel='Reports summary' />;
}
