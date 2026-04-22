import { describe, it, expect, vi, beforeEach } from 'vitest';
import './prismaMock.js';
import { mockPrisma } from './prismaMock.js';
import * as authController from '../src/controllers/authController.js';
import bcrypt from 'bcrypt';

vi.mock('../src/lib/defaultOrgStructure.js', () => ({
  createOrganizationStructure: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../src/services/emailService.js', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../src/config/env.js', () => ({
  env: { frontendUrl: 'http://localhost:3000' },
}));

describe('authController', () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { body: {}, cookies: {}, user: { id: 1 } };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    };
    process.env.ACCESS_SECRET = 'test-access-secret-32chars-longenough';
    process.env.REFRESH_SECRET = 'test-refresh-secret-32chars-longenough';
  });

  // ─── login ──────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should return 400 if user not found', async () => {
      req.body = { email: 'nobody@test.com', password: 'pass' };
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 400 if password is wrong', async () => {
      req.body = { email: 'user@test.com', password: 'wrongpass' };
      const hashedPw = await bcrypt.hash('correctpass', 10);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'user@test.com', password: hashedPw, isActive: true, role: 'EMPLOYEE', organizationId: 10 });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid password' });
    });

    it('should return 403 if user is deactivated', async () => {
      req.body = { email: 'user@test.com', password: 'pass' };
      const hashedPw = await bcrypt.hash('pass', 10);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'user@test.com', password: hashedPw, isActive: false, role: 'EMPLOYEE', organizationId: 10 });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'User deactivated' });
    });

    it('should succeed and issue tokens on valid credentials', async () => {
      req.body = { email: 'admin@test.com', password: 'password123' };
      const hashedPw = await bcrypt.hash('password123', 10);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'admin@test.com', password: hashedPw, isActive: true, role: 'ADMIN', organizationId: 10 });

      await authController.login(req, res);

      expect(res.cookie).toHaveBeenCalledWith('accessToken', expect.any(String), expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('refreshToken', expect.any(String), expect.any(Object));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Login successful' }));
    });
  });

  // ─── forgotPassword ──────────────────────────────────────────────────────────

  describe('forgotPassword', () => {
    it('should return generic response if email not found (prevents enumeration)', async () => {
      req.body = { email: 'unknown@test.com' };
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await authController.forgotPassword(req, res);

      // Should NOT return 404 — that leaks user existence
      expect(res.status).not.toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('If an account with that email exists'),
      }));
    });

    it('should send reset email and update token if user exists', async () => {
      const { sendEmail } = await import('../src/services/emailService.js');
      req.body = { email: 'user@test.com' };
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'user@test.com', organizationId: 10 });
      mockPrisma.user.update.mockResolvedValue({});

      await authController.forgotPassword(req, res);

      expect(mockPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ resetPasswordToken: expect.any(String) }),
      }));
      expect(sendEmail).toHaveBeenCalled();
    });
  });

  // ─── resetPassword ───────────────────────────────────────────────────────────

  describe('resetPassword', () => {
    it('should return 400 if token is expired/invalid', async () => {
      req.body = { token: 'badtoken', newPassword: 'newpass123' };
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired password reset token' });
    });

    it('should reset password and clear token on valid token', async () => {
      req.body = { token: 'validtoken', newPassword: 'newpassword123' };
      mockPrisma.user.findFirst.mockResolvedValue({ id: 1, email: 'user@test.com' });
      mockPrisma.user.update.mockResolvedValue({});

      await authController.resetPassword(req, res);

      expect(mockPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          resetPasswordToken: null,
          resetPasswordExpires: null,
        }),
      }));
      expect(res.json).toHaveBeenCalledWith({ message: 'Password has been reset successfully' });
    });
  });

  // ─── changePassword ──────────────────────────────────────────────────────────

  describe('changePassword', () => {
    it('should reject if same password is reused', async () => {
      req.body = { currentPassword: 'mypass', newPassword: 'mypass' };

      await authController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'New password must be different from current password' });
    });

    it('should reject if current password is wrong', async () => {
      const hashedPw = await bcrypt.hash('correctpass', 10);
      req.body = { currentPassword: 'wrongpass', newPassword: 'newpass123' };
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, password: hashedPw });

      await authController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Current password is incorrect' });
    });
  });
});
