import PageSkeleton from '@/components/ui/PageSkeleton';

/**
 * Fallback while a dashboard page segment streams. Must not duplicate the shell
 * (sidebar/topbar) — those stay mounted in the parent layout.
 */
const Loading = () => {
  return <PageSkeleton />;
};

export default Loading;
