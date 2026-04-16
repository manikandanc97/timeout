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

  const loadEmployees = useCallback(async () => {
    setLoadingList(true);
    try {
      const { data } = await api.get<{ employees: OrganizationEmployee[] }>(
        '/organization/employees',
      );
      setEmployees(data.employees ?? []);
    } catch (error: unknown) {
      setEmployees([]);
      toast.error(getApiErrorMessage(error, 'Could not load employees'));
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoadingList(false);
      return;
    }
    void loadEmployees();
  }, [enabled, loadEmployees]);

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

  const summary = useMemo(
    () => computeEmployeeSummary(employees),
    [employees],
  );

  const filtered = useMemo(
    () =>
      filterEmployees(employees, {
        searchTerm,
        departmentFilter,
        teamFilter,
        statusFilter,
      }),
    [employees, searchTerm, departmentFilter, teamFilter, statusFilter],
  );

  const { page, setPage, pageCount, safePage, pageSlice } = usePagination({
    items: filtered,
    pageSize: EMPLOYEES_PAGE_SIZE,
  });

  useEffect(() => {
    setPage(1);
  }, [searchTerm, departmentFilter, teamFilter, statusFilter, setPage]);

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
  }, []);

  const setDepartmentFilterAndResetTeam = useCallback((value: string) => {
    setDepartmentFilter(value);
    setTeamFilter('ALL');
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
    filtered,
    pageCount,
    safePage,
    pageSlice,
    hasActiveFilters,
    clearFilters,
  };
}
