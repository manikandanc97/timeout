export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type LeaveType = 'ANNUAL' | 'SICK' | 'MATERNITY' | 'PATERNITY';

export interface Leave {
  id: number;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  userId?: number;
  createdAt?: string;
}

/** Leave row returned for admin/manager from GET /leaves */
export interface LeaveWithEmployee extends Leave {
  user: {
    name: string;
    email?: string;
    /** Present when listing as admin/manager; identifies direct-report routing */
    reportingManagerId?: number | null;
  };
}

export interface LeaveBalance {
  annual: number;
  sick: number;
  maternity?: number;
  paternity?: number;
}

export interface LeaveUsage {
  annual: number;
  sick: number;
  maternity?: number;
  paternity?: number;
}

export type LeaveChartSeries = { month: string; value: number }[];

export interface LeaveChartData {
  annual: LeaveChartSeries;
  sick: LeaveChartSeries;
  maternity?: LeaveChartSeries;
  paternity?: LeaveChartSeries;
}

export interface LeaveDashboardData {
  balance: LeaveBalance;
  monthlyUsage?: LeaveUsage;
  chartData?: LeaveChartData;
}
