import dynamic from 'next/dynamic';

const TeamPageClient = dynamic(() => import('./TeamPageClient'), {
  loading: () => null,
});

export default function TeamPage() {
  return <TeamPageClient />;
}
