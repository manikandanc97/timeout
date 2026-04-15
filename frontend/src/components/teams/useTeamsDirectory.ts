'use client';

import { departmentSelectOptions } from '@/components/employees/utils';
import api from '@/services/api';
import type { OrgDepartment } from '@/types/organization';
import type { OrganizationTeamRow } from '@/types/organizationTeam';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { TEAMS_PAGE_SIZE } from './constants';
import {
  computeTeamsSummary,
  filterTeams,
  teamsPageCount,
  teamsPageSlice,
} from './utils';

export function useTeamsDirectory(enabled: boolean) {
  const [teams, setTeams] = useState<OrganizationTeamRow[]>([]);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [loadingList, setLoadingList] = useState(true);
  const [departments, setDepartments] = useState<OrgDepartment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [addDepartmentOpen, setAddDepartmentOpen] = useState(false);
  const [structureLoading, setStructureLoading] = useState(false);

  const loadStructure = useCallback(async () => {
    setStructureLoading(true);
    try {
      const { data } = await api.get<{ departments: OrgDepartment[] }>(
        '/organization/structure',
      );
      setDepartments(data.departments ?? []);
    } catch {
      setDepartments([]);
    } finally {
      setStructureLoading(false);
    }
  }, []);

  const loadTeams = useCallback(async () => {
    setLoadingList(true);
    try {
      const { data } = await api.get<{
        teams: OrganizationTeamRow[];
        departmentCount: number;
      }>('/organization/teams');
      setTeams(data.teams ?? []);
      setDepartmentCount(
        typeof data.departmentCount === 'number' ? data.departmentCount : 0,
      );
    } catch {
      setTeams([]);
      setDepartmentCount(0);
      toast.error('Could not load teams');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoadingList(false);
      return;
    }
    void loadTeams();
  }, [enabled, loadTeams]);

  useEffect(() => {
    if (!enabled) return;
    void loadStructure();
  }, [enabled, loadStructure]);

  const departmentOptionsForFilter = useMemo(
    () => departmentSelectOptions(departments),
    [departments],
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm, departmentFilter]);

  const summary = useMemo(
    () => computeTeamsSummary(teams, departmentCount),
    [teams, departmentCount],
  );

  const filtered = useMemo(
    () =>
      filterTeams(teams, {
        searchTerm,
        departmentFilter,
      }),
    [teams, searchTerm, departmentFilter],
  );

  const pageCount = teamsPageCount(filtered.length);

  useEffect(() => {
    setPage((p) => Math.min(p, pageCount));
  }, [pageCount]);

  const safePage = Math.min(page, pageCount);
  const pageSlice = useMemo(
    () => teamsPageSlice(filtered, safePage, TEAMS_PAGE_SIZE),
    [filtered, safePage],
  );

  const hasActiveFilters =
    searchTerm.trim().length > 0 || departmentFilter !== 'ALL';

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setDepartmentFilter('ALL');
  }, []);

  return {
    teams,
    departments,
    structureLoading,
    loadingList,
    loadTeams,
    searchTerm,
    setSearchTerm,
    departmentFilter,
    setDepartmentFilter,
    page,
    setPage,
    addOpen,
    setAddOpen,
    addDepartmentOpen,
    setAddDepartmentOpen,
    loadStructure,
    departmentOptionsForFilter,
    summary,
    filtered,
    pageCount,
    safePage,
    pageSlice,
    hasActiveFilters,
    clearFilters,
  };
}
