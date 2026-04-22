import { describe, it, expect, vi, beforeEach } from 'vitest';
import './prismaMock.js';
import { mockPrisma } from './prismaMock.js';
import { generateAndSendOTP, verifyOTP } from '../src/services/otpService.js';

vi.mock('../src/services/emailService.js', () => ({
  sendEmail: vi.fn().mockResolvedValue({ messageId: 'test-email-id' }),
}));

describe('otpService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAndSendOTP', () => {
    it('should generate a 6-digit OTP, store it in user settings, and send email', async () => {
      const { sendEmail } = await import('../src/services/emailService.js');
      mockPrisma.user.findUnique.mockResolvedValue({ adminSettings: {} });
      mockPrisma.user.update.mockResolvedValue({});

      await generateAndSendOTP({
        userId: 1,
        organizationId: 10,
        email: 'bob@test.com',
        action: 'DELETE_EMPLOYEE'
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({
          adminSettings: expect.objectContaining({
            pendingAIOTP: expect.objectContaining({
              code: expect.stringMatching(/^\d{6}$/),
              action: 'DELETE_EMPLOYEE'
            })
          })
        })
      }));
      expect(sendEmail).toHaveBeenCalled();
    });
  });

  describe('verifyOTP', () => {
    it('should return valid: false if no pending OTP found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ adminSettings: {} });
      const result = await verifyOTP(1, '123456');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('No pending verification found');
    });

    it('should return valid: false if OTP is expired', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        adminSettings: {
          pendingAIOTP: {
            code: '123456',
            expiresAt: new Date(Date.now() - 1000).toISOString() // 1 second ago
          }
        }
      });
      const result = await verifyOTP(1, '123456');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('expired');
    });

    it('should return valid: false if OTP does not match', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        adminSettings: {
          pendingAIOTP: {
            code: '123456',
            expiresAt: new Date(Date.now() + 60000).toISOString()
          }
        }
      });
      const result = await verifyOTP(1, '654321');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Invalid code');
    });

    it('should return valid: true and clear OTP if valid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        adminSettings: {
          pendingAIOTP: {
            code: '123456',
            expiresAt: new Date(Date.now() + 60000).toISOString()
          }
        }
      });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await verifyOTP(1, '123456');

      expect(result.valid).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          adminSettings: expect.objectContaining({
            pendingAIOTP: null
          })
        })
      }));
    });
  });
});
