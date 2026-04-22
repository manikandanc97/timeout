export type AdminDashboardStats = {
  totalEmployees: number;
  presentToday: number;
  onLeaveToday: number;
  departments: number;
};

export type AdminHrDashboardPayload = {
  employeesOnLeaveToday: { userName: string; leaveType: string }[];
  upcomingBirthdays: { name: string; dateLabel: string }[];
  newJoinersThisWeek: { name: string; teamName: string }[];
  teamEmployeeCounts: { teamName: string; count: number }[];
  employeeAttendanceHoursToday: { userName: string; teamName: string; hours: number }[];
  teamAttendanceHoursToday: { teamName: string; hours: number }[];
};

export type AdminDashboardSnapshot = AdminDashboardStats & AdminHrDashboardPayload;
