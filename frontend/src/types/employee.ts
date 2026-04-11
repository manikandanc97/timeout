export type OrganizationEmployee = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  team: {
    id: number;
    name: string;
    department: { id: number; name: string } | null;
  } | null;
  onLeaveToday: boolean;
};
