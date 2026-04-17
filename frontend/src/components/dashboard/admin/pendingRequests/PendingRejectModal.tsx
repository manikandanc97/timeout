'use client';

import ConfirmModal from '@/components/ui/ConfirmModal';

type RejectTarget = { kind: 'leave'; id: number } | { kind: 'compOff'; id: number } | null;

type Props = {
  rejectTarget: RejectTarget;
  rejectReason: string;
  isRejectingCurrent: boolean;
  onReasonChange: (next: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function PendingRejectModal({
  rejectTarget,
  rejectReason,
  isRejectingCurrent,
  onReasonChange,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <ConfirmModal
      open={rejectTarget !== null}
      title={
        rejectTarget === null
          ? 'Reject request'
          : rejectTarget.kind === 'leave'
            ? 'Reject leave request'
            : 'Reject comp off request'
      }
      message={
        rejectTarget === null
          ? 'Please provide a reason.'
          : rejectTarget.kind === 'leave'
            ? 'Please provide a reason. This will be shown to the employee.'
            : 'Please provide a reason before rejecting this comp off request.'
      }
      cancelLabel='Cancel'
      confirmLabel='Reject'
      isProcessing={isRejectingCurrent}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <textarea
        value={rejectReason}
        onChange={(e) => onReasonChange(e.target.value)}
        rows={4}
        placeholder='Enter rejection reason'
        className='w-full rounded-lg border border-border px-3 py-2 text-sm text-card-foreground/90 outline-none transition-colors focus:border-red-300 focus:ring-2 focus:ring-red-100'
      />
      {!rejectReason.trim() ? (
        <p className='mt-2 text-xs text-destructive'>Rejection reason is required.</p>
      ) : null}
    </ConfirmModal>
  );
}
