export type OrganizationEmployee = {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
  gender?: string | null;
  createdAt: string;
  birthDate?: string | null;
  joiningDate?: string | null;
  reportingManager?: { id: number; name: string } | null;
  team: {
    id: number;
    name: string;
    department: { id: number; name: string } | null;
  } | null;
  onLeaveToday: boolean;
};
