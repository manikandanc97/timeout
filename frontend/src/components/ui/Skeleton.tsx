import React from 'react';

type SkeletonProps = {
  className?: string;
};

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-skeleton/20 ${className}`}
      aria-hidden='true'
    />
  );
}
