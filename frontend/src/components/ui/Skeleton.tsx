import React from 'react';

type SkeletonProps = {
  className?: string;
  style?: React.CSSProperties;
};

export default function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-skeleton/30 ${className}`}
      style={style}
      aria-hidden='true'
    />
  );
}
