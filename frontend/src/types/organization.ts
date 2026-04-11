export type OrgTeam = {
  id: number;
  name: string;
};

export type OrgDepartment = {
  id: number;
  name: string;
  sortOrder: number;
  teams: OrgTeam[];
};
