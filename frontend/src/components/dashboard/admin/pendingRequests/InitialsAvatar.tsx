'use client';

export default function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className='flex justify-center items-center bg-primary/10 rounded-xl w-9 h-9 font-bold text-primary text-xs shrink-0'>
      {initials}
    </div>
  );
}
