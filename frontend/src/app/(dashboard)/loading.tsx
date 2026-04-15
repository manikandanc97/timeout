/**
 * Fallback while a dashboard page segment streams. Must not duplicate the shell
 * (sidebar/topbar) — those stay mounted in the parent layout.
 */
const Loading = () => {
  return (
    <div className='animate-pulse space-y-6' aria-busy aria-label='Loading page'>
      <div className='h-9 max-w-xs rounded-lg bg-muted/90' />
      <div className='grid gap-4 md:grid-cols-2'>
        <div className='h-40 rounded-xl bg-muted/90' />
        <div className='h-40 rounded-xl bg-muted/90' />
      </div>
      <div className='h-64 rounded-xl bg-muted/90' />
    </div>
  );
};

export default Loading;
