import React from 'react';

type TitleTag = 'h1' | 'h2' | 'h3';

type PageCardProps = {
  title: string;
  children: React.ReactNode;
  /** Shown on the right of the title row (e.g. action buttons). */
  titleTrailing?: React.ReactNode;
  /** Merged onto the outer card. If omitted, default padding is `p-6`. */
  className?: string;
  /** Heading element for the title (default `h1` for full pages). */
  titleAs?: TitleTag;
  /** Override title styles (default: large page title). */
  titleClassName?: string;
  /** Override the content wrapper below the title. */
  contentClassName?: string;
};

const PageCard = ({
  title,
  children,
  titleTrailing,
  className,
  titleAs = 'h1',
  titleClassName,
  contentClassName,
}: PageCardProps) => {
  const TitleTag = titleAs;
  const outerClass = `w-full rounded-2xl bg-white shadow-md ${className ?? 'p-6'}`;
  const titleClass =
    titleClassName ?? 'text-2xl font-bold text-gray-900';
  const contentClass = contentClassName ?? 'mt-2 w-full text-gray-600';

  return (
    <div className={outerClass}>
      <div className='flex shrink-0 flex-wrap items-start justify-between gap-3'>
        <TitleTag className={`min-w-0 flex-1 ${titleClass}`}>{title}</TitleTag>
        {titleTrailing ? (
          <div className='flex shrink-0 flex-wrap items-center gap-2'>
            {titleTrailing}
          </div>
        ) : null}
      </div>
      <div className={contentClass}>{children}</div>
    </div>
  );
};

export default PageCard;
