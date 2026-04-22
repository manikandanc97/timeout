import { describe, it, expect, vi, beforeEach } from 'vitest';
import './prismaMock.js';
import { mockPrisma } from './prismaMock.js';
import { sendEmail } from '../src/services/emailService.js';
import nodemailer from 'nodemailer';

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn().mockResolvedValue({ messageId: 'test-id' }),
    }),
  },
}));

describe('emailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SMTP_HOST = 'smtp.test.com';
    process.env.SMTP_USER = 'user';
    process.env.SMTP_PASS = 'pass';
  });

  it('should send email using environment variables if no organizationId is provided', async () => {
    await sendEmail({ to: 'user@test.com', subject: 'Hello', html: '<p>Hi</p>' });

    expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({
      host: 'smtp.test.com',
      auth: { user: 'user', pass: 'pass' },
    }));
  });

  it('should fallback to emulation (logging) if credentials are missing', async () => {
    delete process.env.SMTP_HOST;
    const logSpy = vi.spyOn(console, 'log');

    await sendEmail({ to: 'user@test.com', subject: 'Hello', html: '<p>Hi</p>' });

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[EMULATED EMAIL]'));
    logSpy.mockRestore();
  });

  it('should override SMTP settings from organization adminSettings', async () => {
    mockPrisma.organization.findUnique.mockResolvedValue({
      id: 10,
      name: 'CustomOrg',
      adminSettings: {
        smtpSettings: {
          host: 'org.smtp.com',
          user: 'orguser',
          pass: 'orgpass',
          port: 465,
          secure: true,
          fromEmail: 'hr@customorg.com',
        },
      },
    });

    await sendEmail({ 
      to: 'user@test.com', 
      subject: 'Hello', 
      html: '<p>Hi</p>',
      organizationId: 10 
    });

    expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({
      host: 'org.smtp.com',
      port: 465,
      secure: true,
      auth: { user: 'orguser', pass: 'orgpass' },
    }));
  });

  it('should handle SMTP failure and throw error', async () => {
    const transporter = nodemailer.createTransport();
    transporter.sendMail.mockRejectedValue(new Error('Connection failed'));

    await expect(sendEmail({ to: 'user@test.com', subject: 'Fail', html: '...' })).rejects.toThrow('Failed to send email: Connection failed');
  });
});
