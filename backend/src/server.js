import 'dotenv/config';
import http from 'http';
import express from 'express';
import prisma from './prismaClient.js';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import { authMiddleware } from './middleware/authMiddleware.js';

import leaveRoutes from './routes/leaveRoutes.js';

import cookieParser from 'cookie-parser';
import { getLeaveHistory } from './controllers/leaveController.js';
import holidayRoutes from './routes/holidayRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { initSocketServer } from './socket/socketServer.js';
import aiChatRoutes from './routes/aiChatRoutes.js';

const app = express();

const clientOrigin =
  process.env.CLIENT_ORIGIN?.trim() || 'http://localhost:3000';

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.use('/api/auth', authRoutes);

app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        gender: true,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.use('/api/leaves', leaveRoutes);

app.get('/api/history', authMiddleware, getLeaveHistory);

app.use('/api/holidays', holidayRoutes);

app.use('/api/dashboard', adminRoutes);

app.use('/api/organization', organizationRoutes);
app.use('/api/payroll', payrollRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiChatRoutes);

const httpServer = http.createServer(app);

function requireEnv(name) {
  const v = process.env[name];
  if (v == null || String(v).trim() === '') {
    console.error(
      `[config] Missing or empty environment variable: ${name}\n` +
        `  Copy backend/.env.example to backend/.env and set all values.`,
    );
    process.exit(1);
  }
}

async function start() {
  requireEnv('DATABASE_URL');
  requireEnv('ACCESS_SECRET');
  requireEnv('REFRESH_SECRET');

  try {
    await prisma.$connect();
  } catch (e) {
    console.error(
      '[config] Could not connect to the database:',
      e?.message ?? e,
    );
    process.exit(1);
  }

  initSocketServer(httpServer, { clientOrigin });

  httpServer.listen(5000, () => {
    console.log('Server running on port 5000 (HTTP + Socket.IO)');
  });
}

start();
