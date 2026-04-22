export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AttendanceLog {
  id: number;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  workHours: number | null;
}

export interface RegularizationRequest {
  id: number;
  date: string;
  requestedCheckIn: string | null;
  requestedCheckOut: string | null;
  reason: string;
  status: RequestStatus;
  rejectionReason: string | null;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
    designation: string;
  };
}
