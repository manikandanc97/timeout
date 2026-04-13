'use client';

import EditEmployeeForm from '@/components/employees/EditEmployeeForm';
import type { OrganizationEmployee } from '@/types/employee';
import type { OrgDepartment } from '@/types/organization';
import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  employee: OrganizationEmployee | null;
  departments: OrgDepartment[];
  onClose: () => void;
  onSaved: () => void;
};

export default function EditEmployeeModal({
  open,
  employee,
  departments,
  onClose,
  onSaved,
}: Props) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open || !employee) return null;

  return createPortal(
    <div className='fixed inset-0 z-100 flex items-center justify-center p-4'>
      <button
        type='button'
        aria-label='Close dialog'
        className='absolute inset-0 bg-black/40 backdrop-blur-[2px]'
        onClick={onClose}
      />
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        className='relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-100 bg-white p-6 shadow-xl'
      >
        <div className='flex items-start justify-between gap-4 border-b border-gray-100 pb-4'>
          <div>
            <h2 id={titleId} className='font-bold text-gray-900 text-lg'>
              Edit employee
            </h2>
            <p className='mt-1 text-gray-600 text-sm'>
              Update profile, team, dates, or set a new password.
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg px-2 py-1 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800'
          >
            Close
          </button>
        </div>
        <EditEmployeeForm
          key={employee.id}
          employee={employee}
          departments={departments}
          compact
          onSaved={() => {
            onSaved();
            onClose();
          }}
        />
      </div>
    </div>,
    document.body,
  );
}
