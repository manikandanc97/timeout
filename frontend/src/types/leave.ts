export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type LeaveType = 'ANNUAL' | 'SICK' | 'MATERNITY' | 'PATERNITY';

export interface Leave {
  id: number;
  type: LeaveType;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveStatus;
  /**
   * startDate/endDate are kept optional to support legacy client naming.
   * Prefer fromDate/toDate whenever possible.
   */
  startDate?: string;
  endDate?: string;
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
