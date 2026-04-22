export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type LeaveType =
  | 'ANNUAL'
  | 'SICK'
  | 'MATERNITY'
  | 'PATERNITY'
  | 'COMP_OFF'
  | 'WFH';

export interface Leave {
  id: number;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  rejectionReason?: string | null;
  status: LeaveStatus;
  balanceDeductedDays?: number;
  lopDays?: number;
  lopAmount?: number;
  userId?: number;
  user?: {
    name?: string;
    email?: string;
    reportingManagerId?: number | null;
  };
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
  compOff?: number;
  maternity?: number;
  paternity?: number;
}

export interface LeaveUsage {
  annual: number;
  sick: number;
  compOff?: number;
  maternity?: number;
  paternity?: number;
}

export type LeaveChartSeries = { month: string; value: number }[];

export interface LeaveChartData {
  annual: LeaveChartSeries;
  sick: LeaveChartSeries;
  compOff?: LeaveChartSeries;
  maternity?: LeaveChartSeries;
  paternity?: LeaveChartSeries;
}

export interface LeaveDashboardData {
  balance: LeaveBalance;
  monthlyUsage?: LeaveUsage;
  chartData?: LeaveChartData;
}

export interface PermissionRequest {
  id: number;
  date: string;
  durationMinutes: number;
  startTimeMinutes?: number | null;
  endTimeMinutes?: number | null;
  reason: string;
  status: RequestStatus;
  createdAt: string;
}

export interface PermissionRequestWithEmployee extends PermissionRequest {
  user?: {
    name?: string;
    email?: string;
  };
}

export interface CompOffRequestWithEmployee {
  id: number;
  workDate: string;
  reason: string;
  status: RequestStatus;
  createdAt: string;
  user?: {
    name?: string;
    email?: string;
  };
}

export interface PermissionSummary {
  limitMinutes: number;
  usedMinutes: number;
  remainingMinutes: number;
  requests: PermissionRequest[];
}
