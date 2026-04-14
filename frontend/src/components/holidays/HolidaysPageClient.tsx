'use client';

import HolidayFormModal from '@/components/holidays/HolidayFormModal';
import HolidaysFilterBar from '@/components/holidays/HolidaysFilterBar';
import ConfirmModal from '@/components/ui/ConfirmModal';
import HolidaysPagination from '@/components/holidays/HolidaysPagination';
import HolidaysPageHeader from '@/components/holidays/HolidaysPageHeader';
import HolidaysSummaryCards from '@/components/holidays/HolidaysSummaryCards';
import HolidaysTable from '@/components/holidays/HolidaysTable';
import { useHolidaysPage } from '@/components/holidays/useHolidaysPage';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import type { Holiday } from '@/types/holiday';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export default function HolidaysPageClient() {
  const { user } = useAuth();
  const page = useHolidaysPage();
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editing, setEditing] = useState<Holiday | null>(null);
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canManage = user?.role === 'ADMIN';

  const openAdd = useCallback(() => {
    setFormMode('add');
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((h: Holiday) => {
    setFormMode('edit');
    setEditing(h);
    setFormOpen(true);
  }, []);

  const requestDelete = useCallback(
    (h: Holiday) => {
      if (!canManage) return;
      setHolidayToDelete(h);
    },
    [canManage],
  );

  const closeDeleteModal = useCallback(() => {
    if (deleting) return;
    setHolidayToDelete(null);
  }, [deleting]);

  const confirmDelete = useCallback(async () => {
    if (!holidayToDelete || !canManage) return;
    setDeleting(true);
    try {
      await api.delete(`/holidays/${holidayToDelete.id}`);
      toast.success('Holiday deleted');
      setHolidayToDelete(null);
      void page.load();
    } catch {
      toast.error('Could not delete holiday');
    } finally {
      setDeleting(false);
    }
  }, [canManage, holidayToDelete, page]);

  return (
    <>
      <section className='relative flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white/90 shadow-xl'>
        <div className='absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
        <div className='absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-100 blur-3xl' />

        <div className='relative z-10 flex flex-col gap-3 p-4 sm:gap-4 sm:p-5'>
          <div className='flex min-w-0 flex-col gap-3'>
            <HolidaysPageHeader
              filteredCount={page.filteredRows.length}
              totalLoaded={page.holidays.length}
              hasActiveFilters={page.hasActiveFilters}
            />

            <HolidaysSummaryCards
              loading={page.loading}
              total={page.summary.total}
              upcoming={page.summary.upcoming}
              thisMonth={page.summary.thisMonth}
            />

            <section
              aria-labelledby='holidays-heading'
              className='flex min-w-0 flex-col gap-3 rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-sm sm:gap-3.5 sm:p-4'
            >
              <HolidaysFilterBar
                searchTerm={page.searchTerm}
                onSearchChange={page.setSearchTerm}
                hasActiveFilters={page.hasActiveFilters}
                onClearFilters={page.clearFilters}
                canManage={canManage}
                onAddHoliday={openAdd}
              />

              <div className='flex w-full min-w-0 min-h-124 flex-col overflow-x-auto rounded-xl border border-gray-100 bg-gray-50/40'>
                <HolidaysTable
                  loading={page.loading}
                  rows={page.pageSlice}
                  canManage={canManage}
                  onEdit={openEdit}
                  onDelete={requestDelete}
                />
              </div>

              <HolidaysPagination
                visible={
                  !page.loading &&
                  page.filteredRows.length > page.pageSize
                }
                safePage={page.safePage}
                pageCount={page.pageCount}
                filteredLength={page.filteredRows.length}
                onPrev={() => page.setPage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  page.setPage((p) => Math.min(page.pageCount, p + 1))
                }
              />
            </section>
          </div>
        </div>
      </section>

      {canManage ? (
        <>
          <HolidayFormModal
            open={formOpen}
            mode={formMode}
            holiday={editing}
            onClose={() => setFormOpen(false)}
            onSaved={() => void page.load()}
          />
          <ConfirmModal
            open={holidayToDelete !== null}
            title='Delete holiday'
            message={
              holidayToDelete
                ? `Delete “${holidayToDelete.name}”? This cannot be undone.`
                : ''
            }
            cancelLabel='Cancel'
            confirmLabel='Delete'
            isProcessing={deleting}
            onCancel={closeDeleteModal}
            onConfirm={confirmDelete}
          />
        </>
      ) : null}
    </>
  );
}
