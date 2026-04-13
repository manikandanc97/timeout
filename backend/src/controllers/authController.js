import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';
import { createOrganizationStructure } from '../lib/defaultOrgStructure.js';

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

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
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
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.json({ accessToken: newAccessToken });
  });
};

export const getCurrentUser = async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      organizationId: req.user.organizationId,
      gender: req.user.gender,
    });
  } catch (error) {}
};

export const logout = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  });

  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  });
  res.json({ message: 'Logged out successfully' });
};
