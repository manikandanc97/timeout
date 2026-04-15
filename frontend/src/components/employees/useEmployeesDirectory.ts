'use client';

import api from '@/services/api';
import type { OrganizationEmployee } from '@/types/employee';
import type { OrgDepartment } from '@/types/organization';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { EMPLOYEES_PAGE_SIZE, type EmployeeStatusFilter } from './constants';
import {
  computeEmployeeSummary,
  departmentSelectOptions,
  employeesPageCount,
  employeesPageSlice,
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
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);

  const loadEmployees = useCallback(async () => {
    setLoadingList(true);
    try {
      const { data } = await api.get<{ employees: OrganizationEmployee[] }>(
        '/organization/employees',
      );
      setEmployees(data.employees ?? []);
    } catch {
      setEmployees([]);
      toast.error('Could not load employees');
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

  useEffect(() => {
    setPage(1);
  }, [searchTerm, departmentFilter, teamFilter, statusFilter]);

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

  const pageCount = employeesPageCount(filtered.length);

  useEffect(() => {
    setPage((p) => Math.min(p, pageCount));
  }, [pageCount]);

  const safePage = Math.min(page, pageCount);
  const pageSlice = useMemo(
    () => employeesPageSlice(filtered, safePage, EMPLOYEES_PAGE_SIZE),
    [filtered, safePage],
  );

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
