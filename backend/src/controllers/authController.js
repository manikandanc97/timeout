import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../prismaClient.js';
import { createOrganizationStructure } from '../lib/defaultOrgStructure.js';
import { sendEmail } from '../services/emailService.js';
import { env } from '../config/env.js';

export const register = async (req, res) => {
  try {
    const { organizationName, adminName, password, workEmail } = req.body;

    if (!organizationName || !adminName || !workEmail || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingOrganization = await prisma.organization.findUnique({
      where: { name: organizationName },
    });
    if (existingOrganization) {
      return res.status(400).json({ message: 'Organization already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        email: workEmail,
      },
    });

    await createOrganizationStructure(prisma, organization.id);

    const user = await prisma.user.create({
      data: {
        name: adminName,
        email: workEmail,
        password: hashedPassword,
        role: 'ADMIN',
        organizationId: organization.id,
      },
    });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: 'User deactivated' });
    }

    if (!process.env.ACCESS_SECRET?.trim() || !process.env.REFRESH_SECRET?.trim()) {
      console.error('[auth] ACCESS_SECRET and REFRESH_SECRET must be set in .env');
      return res.status(500).json({ message: 'Server misconfiguration' });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role, organizationId: user.organizationId },
      process.env.ACCESS_SECRET,
      {
        expiresIn: '15m',
      },
    );
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, {
      expiresIn: '1d',
    });

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ message: 'Login successful', accessToken });
  } catch (error) {
    console.error('[auth] login error:', error?.message ?? error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const refreshTokenHandler = (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.REFRESH_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isActive === false) {
      return res.status(403).json({ message: 'User deactivated' });
    }

    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role, organizationId: user.organizationId },
      process.env.ACCESS_SECRET,
      {
        expiresIn: '15m',
      },
    );

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.json({ accessToken: newAccessToken });
  });
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        designation: true,
        organizationId: true,
        gender: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('[auth] getCurrentUser', error?.message ?? error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateProfileName = async (req, res) => {
  try {
    const name = String(req.body?.name ?? '').trim();
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (name.length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        designation: true,
        organizationId: true,
        gender: true,
      },
    });

    return res.json({ message: 'Name updated successfully', user: updatedUser });
  } catch (error) {
    console.error('[auth] updateProfileName', error?.message ?? error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const currentPassword = String(req.body?.currentPassword ?? '');
    const newPassword = String(req.body?.newPassword ?? '');

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    if (currentPassword === newPassword) {
      return res
        .status(400)
        .json({ message: 'New password must be different from current password' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, password: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('[auth] changePassword', error?.message ?? error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const logout = (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  });

  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  });
  res.json({ message: 'Logged out successfully' });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.json({ message: 'If an account with that email exists, we have sent a password reset link.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires,
      },
    });

    const appUrl = env.frontendUrl;
    const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 32px 24px; border-radius: 12px;">
        <h2 style="color: #0f172a; margin-bottom: 8px;">Reset Your Password</h2>
        <p style="color: #475569; margin-bottom: 24px;">We received a request to reset the password for your <strong>Timeout HRM</strong> account associated with <strong>${email}</strong>.</p>
        <p style="color: #475569; margin-bottom: 24px;">Click the button below to reset your password. This link is valid for <strong>1 hour</strong>.</p>
        <a href="${resetLink}" style="display: inline-block; background: #0d9488; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">Reset Password</a>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 28px;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} Timeout HRM. All rights reserved.</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: 'Password Reset Request – Timeout HRM',
      html,
      organizationId: user.organizationId,
    });

    return res.json({ message: 'If an account with that email exists, we have sent a password reset link.' });
  } catch (error) {
    console.error('[auth] forgotPassword', error?.message ?? error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('[auth] resetPassword', error?.message ?? error);
    return res.status(500).json({ message: 'Server Error' });
  }
};
