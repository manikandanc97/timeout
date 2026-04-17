'use client';

export function InitialsAvatar({
  name,
  colorClass,
}: {
  name: string;
  colorClass: string;
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${colorClass}`}
    >
      {initials}
    </div>
  );
}

const avatarColors = [
  'bg-sky-500/15 text-sky-800 dark:bg-sky-400/20 dark:text-sky-200',
  'bg-violet-500/15 text-violet-800 dark:bg-violet-400/20 dark:text-violet-200',
  'bg-emerald-500/15 text-emerald-800 dark:bg-emerald-400/20 dark:text-emerald-200',
  'bg-amber-500/15 text-amber-900 dark:bg-amber-400/20 dark:text-amber-200',
  'bg-rose-500/15 text-rose-800 dark:bg-rose-400/20 dark:text-rose-200',
  'bg-teal-500/15 text-teal-800 dark:bg-teal-400/20 dark:text-teal-200',
];

export function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function LeaveTypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    'Annual Leave': 'bg-sky-500/12 text-sky-800 dark:bg-sky-400/18 dark:text-sky-200',
    'Sick Leave': 'bg-rose-500/12 text-rose-800 dark:bg-rose-400/18 dark:text-rose-200',
    'Maternity Leave': 'bg-pink-500/12 text-pink-800 dark:bg-pink-400/18 dark:text-pink-200',
    'Paternity Leave': 'bg-violet-500/12 text-violet-800 dark:bg-violet-400/18 dark:text-violet-200',
  };
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${map[type] ?? 'bg-muted text-muted-foreground'}`}
    >
      {type}
    </span>
  );
}

export function TeamBar({
  teamName,
  count,
  max,
}: {
  teamName: string;
  count: number;
  max: number;
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className='flex items-center gap-3'>
      <span className='w-32 truncate text-xs font-medium text-card-foreground' title={teamName}>
        {teamName}
      </span>
      <div className='flex flex-1 items-center gap-2'>
        <div className='flex-1 overflow-hidden rounded-full bg-muted' style={{ height: 6 }}>
          <div
            className='h-full rounded-full bg-primary transition-all duration-700'
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className='w-6 text-right text-xs font-semibold tabular-nums text-muted-foreground'>
          {count}
        </span>
      </div>
    </div>
  );
}

export function SectionSkeleton() {
  return <div className='h-44 animate-pulse rounded-2xl border border-border bg-card shadow-sm' />;
}
