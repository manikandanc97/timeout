export default function TeamsNoAccess() {
  return (
    <section className='rounded-3xl border border-border bg-card p-6 shadow-sm'>
      <h1 className='font-bold text-card-foreground text-xl'>Teams</h1>
      <p className='mt-2 text-muted-foreground text-sm'>
        You do not have permission to view organization teams.
      </p>
    </section>
  );
}
