'use client';

import HolidayFormModal from '@/components/holidays/HolidayFormModal';
import HolidaysFilterBar from '@/components/holidays/HolidaysFilterBar';
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

  const onDelete = useCallback(
    async (h: Holiday) => {
      if (!canManage) return;
      const ok = window.confirm(`Delete holiday “${h.name}”?`);
      if (!ok) return;
      try {
        await api.delete(`/holidays/${h.id}`);
        toast.success('Holiday deleted');
        void page.load();
      } catch {
        toast.error('Could not delete holiday');
      }
    },
    [canManage, page],
  );

  return (
    <>
      <section className='relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white/90 shadow-xl'>
        <div className='absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
        <div className='absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-100 blur-3xl' />

        <div className='relative z-10 flex min-h-0 flex-1 flex-col gap-3 p-4 sm:gap-4 sm:p-5'>
          <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-4'>
            <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-3'>
              <HolidaysPageHeader
                filteredCount={page.filteredRows.length}
                totalLoaded={page.holidays.length}
                hasActiveFilters={page.hasActiveFilters}
              />

              <section
                aria-labelledby='holidays-heading'
                className='flex min-h-0 min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-sm sm:gap-3.5 sm:p-4'
              >
                <HolidaysFilterBar
                  searchTerm={page.searchTerm}
                  onSearchChange={page.setSearchTerm}
                  hasActiveFilters={page.hasActiveFilters}
                  onClearFilters={page.clearFilters}
                  canManage={canManage}
                  onAddHoliday={openAdd}
                />

                <div className='flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-gray-50/40'>
                  <HolidaysTable
                    loading={page.loading}
                    rows={page.filteredRows}
                    canManage={canManage}
                    onEdit={openEdit}
                    onDelete={onDelete}
                  />
                </div>
              </section>
            </div>

            <HolidaysSummaryCards
              loading={page.loading}
              total={page.summary.total}
              upcoming={page.summary.upcoming}
              thisMonth={page.summary.thisMonth}
            />
          </div>
        </div>
      </section>

      {canManage ? (
        <HolidayFormModal
          open={formOpen}
          mode={formMode}
          holiday={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => void page.load()}
        />
      ) : null}
    </>
  );
}
