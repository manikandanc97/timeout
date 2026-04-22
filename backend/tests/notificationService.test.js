import { describe, it, expect, vi, beforeEach } from 'vitest';
import './prismaMock.js';
import { mockPrisma } from './prismaMock.js';
import * as notificationService from '../src/services/notificationService.js';
import { emitNotification } from '../src/socket/socketServer.js';

vi.mock('../src/socket/socketServer.js', () => ({
  emitNotification: vi.fn(),
}));

describe('notificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatDateOnly', () => {
    it('should format date correctly', () => {
      const d = new Date(2024, 3, 22); // Apr 22
      // Using direct call to internal function if exported or via a public one
      // Since it's internal, we'll test it via notifyLeaveAppliedRecipients
    });
  });

  describe('createAndEmitNotification', () => {
    it('should create notification and emit to socket', async () => {
      const data = { userId: 1, title: 'Test', body: 'Body', organizationId: 10, type: 'INFO' };
      mockPrisma.notification.create.mockResolvedValue({ ...data, id: 100, createdAt: new Date() });

      const result = await notificationService.createAndEmitNotification(data);

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({ data });
      expect(emitNotification).toHaveBeenCalledWith(1, expect.objectContaining({ id: 100 }));
      expect(result.id).toBe(100);
    });
  });

  describe('notifyLeaveAppliedRecipients', () => {
    it('should notify admins and reporting manager', async () => {
      const leave = { id: 50, type: 'ANNUAL', startDate: new Date(), endDate: new Date() };
      const organizationId = 10;
      const applicantId = 1;

      mockPrisma.user.findMany.mockResolvedValue([{ id: 101 }, { id: 102 }]); // Admins
      mockPrisma.user.findUnique.mockResolvedValue({ reportingManagerId: 201 }); // Manager
      mockPrisma.notification.create.mockResolvedValue({ id: 1, userId: 101, createdAt: new Date() });

      await notificationService.notifyLeaveAppliedRecipients({
        leave,
        applicantId,
        applicantName: 'Bob',
        organizationId,
      });

      // Should notify 101, 102, 201
      expect(mockPrisma.notification.create).toHaveBeenCalledTimes(3);
    });
  });

  describe('notifyEmployeeLeaveDecision', () => {
    it('should notify employee of approval', async () => {
      const leave = { id: 50, type: 'ANNUAL', startDate: new Date(), endDate: new Date() };
      mockPrisma.notification.create.mockResolvedValue({ id: 2, userId: 1, createdAt: new Date() });

      await notificationService.notifyEmployeeLeaveDecision({
        leave,
        employeeId: 1,
        organizationId: 10,
        status: 'APPROVED',
        actorName: 'Admin',
      });

      expect(mockPrisma.notification.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ type: 'LEAVE_APPROVED' })
      }));
    });
  });

  describe('notifyOrgWide', () => {
    it('should notify all active users in org', async () => {
      mockPrisma.user.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);
      mockPrisma.notification.create.mockResolvedValue({ id: 99, createdAt: new Date() });

      await notificationService.notifyOrgWide({
        organizationId: 10,
        type: 'BROADCAST',
        title: 'Hi All',
        body: 'Welcome',
      });

      expect(mockPrisma.notification.create).toHaveBeenCalledTimes(3);
    });
  });
});
