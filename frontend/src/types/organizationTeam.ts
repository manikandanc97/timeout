export type TeamRowStatus = 'ACTIVE' | 'EMPTY';

export type OrganizationTeamRow = {
  id: number;
  name: string;
  departmentId: number;
  departmentName: string;
  createdAt: string;
  employeeCount: number;
  lead: { id: number; name: string; email: string } | null;
  status: TeamRowStatus;
};
