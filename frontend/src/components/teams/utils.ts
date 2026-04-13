import type { OrganizationTeamRow } from '@/types/organizationTeam';

import { TEAMS_PAGE_SIZE } from './constants';

export type TeamsDirectorySummary = {
  totalTeams: number;
  totalDepartments: number;
};

export function computeTeamsSummary(
  teams: OrganizationTeamRow[],
  departmentCount: number,
): TeamsDirectorySummary {
  return {
    totalTeams: teams.length,
    totalDepartments: departmentCount,
  };
}

export function filterTeams(
  teams: OrganizationTeamRow[],
  params: {
    searchTerm: string;
    departmentFilter: string;
  },
): OrganizationTeamRow[] {
  const q = params.searchTerm.trim().toLowerCase();
  const deptId =
    params.departmentFilter === 'ALL' ? null : Number(params.departmentFilter);

  return teams.filter((row) => {
    const name = row.name.toLowerCase();
    const deptName = row.departmentName.toLowerCase();
    const leadName = row.lead?.name.toLowerCase() ?? '';
    const matchesSearch =
      q.length === 0 ||
      name.includes(q) ||
      deptName.includes(q) ||
      leadName.includes(q);

    const matchesDept = deptId == null || row.departmentId === deptId;

    return matchesSearch && matchesDept;
  });
}

export function teamsPageCount(filteredLength: number) {
  return Math.max(1, Math.ceil(filteredLength / TEAMS_PAGE_SIZE));
}

export function teamsPageSlice<T>(
  filtered: T[],
  safePage: number,
  pageSize: number = TEAMS_PAGE_SIZE,
) {
  const start = (safePage - 1) * pageSize;
  return filtered.slice(start, start + pageSize);
}
