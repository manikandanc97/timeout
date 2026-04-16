import type { LucideIcon } from 'lucide-react';

export type KpiCardItem = {
  key: string;
  label: string;
  value: string | number;
  accent?: string;
  subtitle?: string;
  Icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
};

type KpiCardGridProps = {
  items: KpiCardItem[];
  columnsClassName?: string;
  cardClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
  skeletonCount?: number;
  loading?: boolean;
  ariaLabel?: string;
};

export default function KpiCardGrid({
  items,
  columnsClassName = 'grid w-full shrink-0 grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-3.5',
  cardClassName = 'rounded-2xl border border-border border-l-4 bg-card p-3 shadow-sm sm:p-3.5',
  labelClassName = 'text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs',
  valueClassName = 'mt-2 text-xl font-bold tabular-nums tracking-tight text-card-foreground sm:mt-2.5 sm:text-2xl',
  skeletonCount = items.length,
  loading = false,
  ariaLabel,
}: KpiCardGridProps) {
  if (loading) {
    return (
      <section aria-label={ariaLabel} className={columnsClassName}>
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <article
            key={idx}
            className={`${cardClassName} animate-pulse border-l-border`}
          >
            <div className='h-3 w-20 rounded bg-skeleton' />
            <div className='mt-2 h-8 w-14 rounded bg-skeleton' />
          </article>
        ))}
      </section>
    );
  }

  return (
    <section aria-label={ariaLabel} className={columnsClassName}>
      {items.map((item) => {
        const Icon = item.Icon;
        return (
          <article
            key={item.key}
            className={`${cardClassName} ${item.accent ?? 'border-l-border'}`.trim()}
          >
            <div className='flex items-center justify-between gap-2'>
              <p className={labelClassName}>{item.label}</p>
              {Icon ? (
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 sm:rounded-xl ${item.iconBg ?? 'bg-muted'}`}
                >
                  <Icon size={17} strokeWidth={2} className={item.iconColor ?? 'text-card-foreground'} />
                </div>
              ) : null}
            </div>
            <p className={valueClassName}>{item.value}</p>
            {item.subtitle ? <p className='mt-1 text-[10px] text-muted-foreground sm:text-[11px]'>{item.subtitle}</p> : null}
          </article>
        );
      })}
    </section>
  );
}
