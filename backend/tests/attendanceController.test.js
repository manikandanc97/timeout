import { describe, it, expect, vi, beforeEach } from 'vitest';
import './prismaMock.js';
import { mockPrisma } from './prismaMock.js';
import * as attendanceController from '../src/controllers/attendanceController.js';

describe('attendanceController', () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { user: { id: 1, organizationId: 10 }, body: {}, query: {}, params: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, organizationId: 10, role: 'EMPLOYEE', reportingManagerId: 2, isActive: true });
    mockPrisma.user.findMany.mockResolvedValue([]);
  });

  describe('punchIn', () => {
    it('should create a new attendance log if not punched in today', async () => {
      mockPrisma.attendanceLog.findFirst.mockResolvedValue(null);

      await attendanceController.punchIn(req, res);

      expect(mockPrisma.attendanceLog.upsert).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Punched in successfully' }));
    });

    it('should return 400 if already punched in', async () => {
      mockPrisma.attendanceLog.findUnique.mockResolvedValue({ id: 100, checkIn: new Date() });

      await attendanceController.punchIn(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Already punched in today' });
    });
  });

  describe('punchOut', () => {
    it('should update the attendance log if punched in', async () => {
      const checkIn = new Date(Date.now() - 4 * 3600000); // 4 hours ago
      mockPrisma.attendanceLog.findUnique.mockResolvedValue({ id: 100, checkIn });
      mockPrisma.attendanceLog.update.mockResolvedValue({ id: 100, checkOut: new Date() });

      await attendanceController.punchOut(req, res);

      expect(mockPrisma.attendanceLog.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Punched out successfully' }));
    });
  });

  describe('requestRegularization', () => {
    it('should create a request if none exists', async () => {
      req.body = { date: '2024-04-22', reason: 'Forgot to punch in', requestedCheckIn: new Date() };
      mockPrisma.regularizationRequest.findFirst.mockResolvedValue(null);
      mockPrisma.regularizationRequest.create.mockResolvedValue({ id: 1 });

      await attendanceController.requestRegularization(req, res);

      expect(mockPrisma.regularizationRequest.create).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Regularization request submitted' }));
    });

    it('should return 400 if request already pending', async () => {
      req.body = { date: '2024-04-22', reason: 'Forgot' };
      mockPrisma.regularizationRequest.findFirst.mockResolvedValue({ id: 1, status: 'PENDING' });

      await attendanceController.requestRegularization(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateRegularizationStatus', () => {
    it('should reject non-manager/admin access', async () => {
      req.params = { id: 1 };
      req.body = { status: 'APPROVED' };
      mockPrisma.regularizationRequest.findUnique.mockResolvedValue({ id: 1, userId: 2, organizationId: 10, status: 'PENDING', date: new Date() });
      
      // User is EMPLOYEE, requester is User 2
      await attendanceController.updateRegularizationStatus(req, res);
      
      // It will fail at canModerateRegularization
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized to approve this request' });
    });

    it('should prevent self-approval', async () => {
      req.params = { id: 1 };
      req.body = { status: 'APPROVED' };
      mockPrisma.user.findUnique.mockImplementation(async ({ where }) => {
        if (where.id === 1) return { id: 1, role: 'MANAGER', organizationId: 10, reportingManagerId: 5 };
        return null;
      });
      mockPrisma.regularizationRequest.findUnique.mockResolvedValue({ id: 1, userId: 1, organizationId: 10, status: 'PENDING', date: new Date() });

      await attendanceController.updateRegularizationStatus(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Self-approval is not allowed. Your regularization request must be approved by your manager or HR.' });
    });

    it('should apply regularization and update log when approved', async () => {
      req.params = { id: 1 };
      req.body = { status: 'APPROVED' };
      mockPrisma.user.findUnique.mockImplementation(async ({ where }) => {
        if (where.id === 2) return { id: 2, role: 'MANAGER', organizationId: 10 }; // the actor
        if (where.id === 1) return { id: 1, role: 'EMPLOYEE', organizationId: 10, reportingManagerId: 2, isActive: true }; // the requester
        return null;
      });
      req.user.id = 2; // Actor is the manager

      mockPrisma.regularizationRequest.findUnique.mockResolvedValue({
        id: 1, userId: 1, organizationId: 10, status: 'PENDING', date: new Date(),
        requestedCheckIn: new Date(), requestedCheckOut: new Date(Date.now() + 3600000)
      });
      mockPrisma.regularizationRequest.update.mockResolvedValue({ id: 1, status: 'APPROVED' });
      mockPrisma.attendanceLog.findUnique.mockResolvedValue({ id: 99 });
      mockPrisma.attendanceLog.upsert.mockResolvedValue({ id: 99 });

      await attendanceController.updateRegularizationStatus(req, res);

      // It calls upsert inside the transaction. mockPrisma is passed as the transaction object.
      expect(mockPrisma.attendanceLog.upsert).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Regularization request approved' }));
    });
  });
});
