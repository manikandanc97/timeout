'use client';

import { usePagination } from '@/hooks/usePagination';
import api from '@/services/api';
import type { OrganizationEmployee } from '@/types/employee';
import type { OrgDepartment } from '@/types/organization';
import { getApiErrorMessage } from '@/utils/apiError';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { EMPLOYEES_PAGE_SIZE, type EmployeeStatusFilter } from './constants';
import {
  computeEmployeeSummary,
  departmentSelectOptions,
  filterEmployees,
  teamSelectOptions,
} from './utils';

export function useEmployeesDirectory(enabled: boolean) {
  const [employees, setEmployees] = useState<OrganizationEmployee[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [departments, setDepartments] = useState<OrgDepartment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<EmployeeStatusFilter>('ALL');
  const [addOpen, setAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const loadEmployees = useCallback(async () => {
    if (!enabled) return;
    setLoadingList(true);
    try {
      const { data } = await api.get<{ 
        employees: OrganizationEmployee[],
        meta: { total: number, totalPages: number }
      }>(
        '/organization/employees',
        {
          params: {
            page,
            limit: EMPLOYEES_PAGE_SIZE,
            search: searchTerm,
            departmentId: departmentFilter,
            teamId: teamFilter,
            status: statusFilter,
          }
        }
      );
      setEmployees(data.employees ?? []);
      setMeta(data.meta ?? { total: (data.employees ?? []).length, totalPages: 1 });
    } catch (error: unknown) {
      setEmployees([]);
      toast.error(getApiErrorMessage(error, 'Could not load employees'));
    } finally {
      setLoadingList(false);
    }
  }, [enabled, page, searchTerm, departmentFilter, teamFilter, statusFilter]);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    async function loadStructure() {
      try {
        const { data } = await api.get<{ departments: OrgDepartment[] }>(
          '/organization/structure',
        );
        if (!cancelled) setDepartments(data.departments ?? []);
      } catch {
        if (!cancelled) setDepartments([]);
      }
    }
    void loadStructure();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const departmentOptionsForFilter = useMemo(
    () => departmentSelectOptions(departments),
    [departments],
  );

  const teamOptionsForFilter = useMemo(
    () => teamSelectOptions(departments, departmentFilter),
    [departments, departmentFilter],
  );

  useEffect(() => {
    if (teamFilter === 'ALL') return;
    if (!teamOptionsForFilter.some((o) => o.value === teamFilter)) {
      setTeamFilter('ALL');
    }
  }, [teamOptionsForFilter, teamFilter]);

  // Summary might need adjustments if it's supposed to be global.
  // For now, it will summarize only the CURRENT page, which is a common limitation of server-side paging
  // unless a separate summary API is provided. To be perfect, we'd need another API call.
  const summary = useMemo(
    () => computeEmployeeSummary(employees),
    [employees],
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm, departmentFilter, teamFilter, statusFilter]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    departmentFilter !== 'ALL' ||
    teamFilter !== 'ALL' ||
    statusFilter !== 'ALL';

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setDepartmentFilter('ALL');
    setTeamFilter('ALL');
    setStatusFilter('ALL');
    setPage(1);
  }, []);

  const setDepartmentFilterAndResetTeam = useCallback((value: string) => {
    setDepartmentFilter(value);
    setTeamFilter('ALL');
    setPage(1);
  }, []);

  return {
    employees,
    loadingList,
    loadEmployees,
    departments,
    searchTerm,
    setSearchTerm,
    departmentFilter,
    setDepartmentFilter: setDepartmentFilterAndResetTeam,
    teamFilter,
    setTeamFilter,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    addOpen,
    setAddOpen,
    departmentOptionsForFilter,
    teamOptionsForFilter,
    summary,
    filtered: employees, // In server-side paging, filtered result is just the employees returned
    pageCount: meta.totalPages,
    safePage: page,
    pageSlice: employees, // No slicing needed on client side
    hasActiveFilters,
    clearFilters,
  };
}
