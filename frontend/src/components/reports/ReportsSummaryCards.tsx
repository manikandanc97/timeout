type ReportsSummaryCardsProps = {
  totalEmployees: number;
  employeesOnLeave: number;
  totalSalaryPaid: string;
  pendingRequests: number;
  newJoiners: number;
};

const cards = [
  { key: 'totalEmployees', label: 'Total Employees', accent: 'border-l-sky-400' },
  { key: 'employeesOnLeave', label: 'Employees On Leave', accent: 'border-l-amber-400' },
  { key: 'totalSalaryPaid', label: 'Total Salary Paid', accent: 'border-l-emerald-400' },
  { key: 'pendingRequests', label: 'Pending Requests', accent: 'border-l-violet-400' },
  { key: 'newJoiners', label: 'New Joiners', accent: 'border-l-indigo-400' },
] as const;

export default function ReportsSummaryCards(props: ReportsSummaryCardsProps) {
  const values = {
    totalEmployees: String(props.totalEmployees),
    employeesOnLeave: String(props.employeesOnLeave),
    totalSalaryPaid: props.totalSalaryPaid,
    pendingRequests: String(props.pendingRequests),
    newJoiners: String(props.newJoiners),
  };

  return (
    <section className='grid w-full shrink-0 grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-3.5'>
      {cards.map((card) => (
        <article
          key={card.key}
          className={`rounded-2xl border border-border border-l-4 ${card.accent} bg-card p-3 shadow-sm sm:p-3.5`}
        >
          <p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs'>
            {card.label}
          </p>
          <p className='mt-2 text-xl font-bold tabular-nums tracking-tight text-card-foreground sm:mt-2.5 sm:text-2xl'>
            {values[card.key]}
          </p>
        </article>
      ))}
    </section>
  );
}
