/**
 * OTP Service
 * Handles generation, storage, and verification of short-lived OTP codes for sensitive AI actions.
 */

import prisma from '../prismaClient.js';
import { sendEmail } from './emailService.js';
import crypto from 'crypto';

const OTP_EXPIRY_MINUTES = 5;

/**
 * Generate a 6-digit OTP and store it in temporary memory (or DB).
 * For production persistence across restarts, we'll use a dedicated table or Redis.
 * Here we use a simple DB-backed approach for reliability.
 */
export const generateAndSendOTP = async ({ userId, organizationId, email, action }) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Store in DB - we'll reuse the resetPasswordToken fields or a dedicated metadata field
  // Better approach: Use a dedicated JSON field in User for temporary session data
  await prisma.user.update({
    where: { id: userId },
    data: {
      adminSettings: {
        ...(await getAdminSettings(userId)),
        pendingAIOTP: {
          code: otp,
          action,
          expiresAt: expiresAt.toISOString(),
        }
      }
    }
  });

  const html = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
      <h2 style="color: #0d9488;">Security Verification</h2>
      <p>A sensitive action was requested via AI: <strong>${action}</strong>.</p>
      <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="color: #666; font-size: 14px;">This code will expire in ${OTP_EXPIRY_MINUTES} minutes. If you did not request this, please change your password immediately.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Verification Code: ${otp}`,
    html,
    organizationId,
  });

  return true;
};

export const verifyOTP = async (userId, inputOtp) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { adminSettings: true }
  });

  const pending = (user.adminSettings || {}).pendingAIOTP;
  
  if (!pending) return { valid: false, message: 'No pending verification found' };
  
  const isExpired = new Date() > new Date(pending.expiresAt);
  if (isExpired) return { valid: false, message: 'Code has expired. Please try again.' };
  
  if (pending.code !== String(inputOtp).trim()) {
    return { valid: false, message: 'Invalid code provided.' };
  }

  // Clear OTP after success
  await prisma.user.update({
    where: { id: userId },
    data: {
      adminSettings: {
        ...(user.adminSettings || {}),
        pendingAIOTP: null
      }
    }
  });

  return { valid: true };
};

async function getAdminSettings(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { adminSettings: true }
  });
  return user.adminSettings || {};
}
