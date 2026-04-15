import type { AssistantCard } from '../types';

interface Props {
  cards: AssistantCard[];
}

const LeaveBalanceCard = ({ data }: { data: Record<string, unknown> }) => (
  <div className='mt-2 grid grid-cols-2 gap-2 text-xs'>
    {Object.entries(data).map(([key, value]) => (
      <div key={key} className='rounded-lg border border-border bg-card px-2 py-1.5'>
        <p className='text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>
          {key}
        </p>
        <p className='text-sm font-semibold text-card-foreground'>{String(value)}</p>
      </div>
    ))}
  </div>
);

const HolidayListCard = ({ data }: { data: unknown }) => {
  const rows = Array.isArray(data) ? data : [];
  return (
    <ul className='mt-2 space-y-1.5 text-xs'>
      {rows.slice(0, 10).map((row) => {
        const item = row as { name?: string; isoDate?: string; date?: string };
        return (
          <li
            key={`${item.isoDate ?? item.date}-${item.name}`}
            className='flex items-center justify-between rounded-lg border border-border bg-card px-2 py-1.5'
          >
            <span className='font-medium text-card-foreground'>{item.name}</span>
            <span className='text-muted-foreground'>{item.isoDate ?? item.date}</span>
          </li>
        );
      })}
    </ul>
  );
};

const PayslipCard = ({ data }: { data: Record<string, unknown> }) => (
  <div className='mt-2 space-y-1 rounded-lg border border-border bg-card px-2 py-2 text-xs'>
    <div className='flex justify-between'>
      <span className='text-muted-foreground'>Period</span>
      <span className='font-medium text-card-foreground'>
        {String(data.month ?? '')}/{String(data.year ?? '')}
      </span>
    </div>
    <div className='flex justify-between'>
      <span className='text-muted-foreground'>Net salary</span>
      <span className='font-semibold text-card-foreground'>{String(data.netSalary ?? '')}</span>
    </div>
    <div className='flex justify-between'>
      <span className='text-muted-foreground'>Status</span>
      <span className='font-medium text-card-foreground'>{String(data.status ?? '')}</span>
    </div>
  </div>
);

const RequestStatusCard = ({ data }: { data: unknown }) => {
  const rows = Array.isArray(data) ? data : [];
  return (
    <div className='mt-2 space-y-1.5 text-xs'>
      {rows.slice(0, 8).map((row) => {
        const item = row as {
          id?: number;
          type?: string;
          status?: string;
          user?: { name?: string };
        };
        return (
          <div
            key={item.id}
            className='rounded-lg border border-border bg-card px-2 py-1.5 text-[11px]'
          >
            <div className='flex justify-between gap-2'>
              <span className='font-semibold text-card-foreground'>
                #{item.id} · {item.type}
              </span>
              <span className='text-muted-foreground'>{item.status}</span>
            </div>
            {item.user?.name ? (
              <p className='mt-0.5 text-muted-foreground'>{item.user.name}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

const PolicyCard = ({ data }: { data: Record<string, unknown> }) => {
  const docs = Array.isArray(data.documents) ? data.documents : [];
  return (
    <div className='mt-2 space-y-2 text-xs'>
      {docs.length > 0 ? (
        <ul className='space-y-1.5'>
          {docs.map((doc) => {
            const row = doc as { id?: number; title?: string; category?: string; excerpt?: string };
            return (
              <li key={row.id} className='rounded-lg border border-border bg-card px-2 py-1.5'>
                <p className='font-semibold text-card-foreground'>{row.title}</p>
                {row.category ? (
                  <p className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                    {row.category}
                  </p>
                ) : null}
                {row.excerpt ? (
                  <p className='mt-1 whitespace-pre-wrap text-muted-foreground'>{row.excerpt}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className='text-muted-foreground'>
          No standalone policy documents yet. If configured, the organization JSON policy is shown
          below.
        </p>
      )}
      {data.leavePolicy != null ? (
        <pre className='max-h-40 overflow-auto rounded-lg bg-muted/60 p-2 text-[11px] text-card-foreground'>
          {JSON.stringify(data.leavePolicy, null, 2)}
        </pre>
      ) : null}
    </div>
  );
};

const ConfirmationCard = ({ data }: { data: Record<string, unknown> }) => {
  const payload =
    data.payload && typeof data.payload === 'object'
      ? (data.payload as Record<string, unknown>)
      : {};
  const action = String(data.action ?? '');
  return (
    <div className='mt-2 rounded-lg border border-border bg-card p-2 text-xs'>
      <p className='font-semibold text-card-foreground'>Pending: {action.replace(/_/g, ' ')}</p>
      <div className='mt-2 grid grid-cols-2 gap-2'>
        {Object.entries(payload).map(([key, value]) => (
          <div key={key} className='rounded border border-border bg-muted/40 px-2 py-1'>
            <p className='text-[10px] uppercase text-muted-foreground'>{key}</p>
            <p className='text-card-foreground'>{String(value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ApprovalCard = ({ data }: { data: Record<string, unknown> }) => {
  const result =
    data.result && typeof data.result === 'object'
      ? (data.result as Record<string, unknown>)
      : {};
  return (
    <div className='mt-2 rounded-lg border border-border bg-card p-2 text-xs'>
      <p className='font-semibold text-card-foreground'>Action completed</p>
      <p className='mt-1 text-muted-foreground'>{String(result.message ?? 'Done')}</p>
    </div>
  );
};

const JsonFallback = ({ value }: { value: unknown }) => (
  <pre className='mt-2 max-h-48 overflow-auto rounded-lg bg-muted/60 p-2 text-[11px] text-card-foreground'>
    {JSON.stringify(value, null, 2)}
  </pre>
);

const renderCardBody = (card: AssistantCard) => {
  if (card.type === 'leave_balance_card' && card.data && typeof card.data === 'object') {
    return <LeaveBalanceCard data={card.data as Record<string, unknown>} />;
  }
  if (card.type === 'holiday_card') {
    return <HolidayListCard data={card.data} />;
  }
  if (card.type === 'payslip_card' && card.data && typeof card.data === 'object') {
    return <PayslipCard data={card.data as Record<string, unknown>} />;
  }
  if (card.type === 'request_status_card') {
    return <RequestStatusCard data={card.data} />;
  }
  if (card.type === 'policy_card' && card.data && typeof card.data === 'object') {
    return <PolicyCard data={card.data as Record<string, unknown>} />;
  }
  if (card.type === 'confirmation_card' && card.data && typeof card.data === 'object') {
    return <ConfirmationCard data={card.data as Record<string, unknown>} />;
  }
  if (card.type === 'approval_card' && card.data && typeof card.data === 'object') {
    return <ApprovalCard data={card.data as Record<string, unknown>} />;
  }
  return <JsonFallback value={card.data} />;
};

const AssistantMessageCards = ({ cards }: Props) => {
  if (!cards.length) return null;
  return (
    <div className='mt-2 space-y-2'>
      {cards.map((card, idx) => (
        <div
          key={`${card.type}-${idx}`}
          className='rounded-lg border border-border bg-muted/40 p-2 text-card-foreground'
        >
          <p className='text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>
            {card.type.replace(/_/g, ' ')}
          </p>
          {renderCardBody(card)}
        </div>
      ))}
    </div>
  );
};

export default AssistantMessageCards;
