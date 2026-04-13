import type { OrganizationEmployee } from '@/types/employee';
import type { OrgDepartment } from '@/types/organization';

import {
  EMPLOYEES_PAGE_SIZE,
  NEW_JOINER_DAYS,
  type EmployeeStatusFilter,
} from './constants';

export type EmployeeDirectorySummary = {
  total: number;
  active: number;
  onLeave: number;
  newJoiners: number;
};

export function isNewJoiner(
  createdAtIso: string,
  days: number = NEW_JOINER_DAYS,
) {
  const created = new Date(createdAtIso);
  if (Number.isNaN(created.getTime())) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  return created >= cutoff;
}

export function roleLabel(role: string) {
  if (role === 'MANAGER') return 'Manager';
  if (role === 'EMPLOYEE') return 'Employee';
  return role;
}

export function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const a = parts[0]?.[0] ?? '';
  const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (a + b).toUpperCase() || '?';
}

export function formatJoined(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function computeEmployeeSummary(
  employees: OrganizationEmployee[],
): EmployeeDirectorySummary {
  const total = employees.length;
  const onLeave = employees.filter((e) => e.onLeaveToday).length;
  const active = Math.max(0, total - onLeave);
  const newJoiners = employees.filter((e) => isNewJoiner(e.createdAt)).length;
  return { total, active, onLeave, newJoiners };
}

export function filterEmployees(
  employees: OrganizationEmployee[],
  params: {
    searchTerm: string;
    departmentFilter: string;
    teamFilter: string;
    statusFilter: EmployeeStatusFilter;
  },
): OrganizationEmployee[] {
  const q = params.searchTerm.trim().toLowerCase();
  const deptId =
    params.departmentFilter === 'ALL' ? null : Number(params.departmentFilter);
  const tmId =
    params.teamFilter === 'ALL' ? null : Number(params.teamFilter);

  return employees.filter((row) => {
    const name = row.name.toLowerCase();
    const email = row.email.toLowerCase();
    const rm = row.reportingManager?.name?.toLowerCase() ?? '';
    const matchesSearch =
      q.length === 0 ||
      name.includes(q) ||
      email.includes(q) ||
      (rm.length > 0 && rm.includes(q));

    const rowDeptId = row.team?.department?.id ?? null;
    const rowTeamId = row.team?.id ?? null;
    const matchesDept = deptId == null || rowDeptId === deptId;
    const matchesTeam = tmId == null || rowTeamId === tmId;

    const matchesStatus =
      params.statusFilter === 'ALL' ||
      (params.statusFilter === 'ACTIVE' && !row.onLeaveToday) ||
      (params.statusFilter === 'ON_LEAVE' && row.onLeaveToday);

    return matchesSearch && matchesDept && matchesTeam && matchesStatus;
  });
}

export function departmentSelectOptions(departments: OrgDepartment[]) {
  return departments.map((d) => ({
    label: d.name,
    value: String(d.id),
  }));
}

export function teamSelectOptions(
  departments: OrgDepartment[],
  departmentFilter: string,
): { label: string; value: string }[] {
  if (departmentFilter === 'ALL') {
    const opts: { label: string; value: string }[] = [];
    for (const d of departments) {
      for (const t of d.teams) {
        opts.push({
          label: `${t.name} (${d.name})`,
          value: String(t.id),
        });
      }
    }
    return opts;
  }
  const dept = departments.find((d) => String(d.id) === departmentFilter);
  if (!dept) return [];
  return dept.teams.map((t) => ({ label: t.name, value: String(t.id) }));
}

export function employeesPageCount(filteredLength: number) {
  return Math.max(1, Math.ceil(filteredLength / EMPLOYEES_PAGE_SIZE));
}

export function employeesPageSlice<T>(
  filtered: T[],
  safePage: number,
  pageSize: number = EMPLOYEES_PAGE_SIZE,
) {
  const start = (safePage - 1) * pageSize;
  return filtered.slice(start, start + pageSize);
}
