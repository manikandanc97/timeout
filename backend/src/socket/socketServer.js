import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../services/loggerService.js';

/** @type {import('socket.io').Server | null} */
let ioInstance = null;

/**
 * @param {import('http').Server} httpServer
 * @param {{ clientOrigin?: string | string[] }} [opts]
 */
export function initSocketServer(httpServer, opts = {}) {
  const clientOrigin = Array.isArray(opts.clientOrigin)
    ? opts.clientOrigin
    : opts.clientOrigin?.trim() ||
      process.env.CLIENT_ORIGIN?.trim() ||
      'http://localhost:3000';

  const io = new Server(httpServer, {
    path: '/socket.io',
    cors: {
      origin: clientOrigin,
      credentials: true,
    },
    connectionStateRecovery: {},
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ??
        socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '');

      if (!token || typeof token !== 'string') {
        return next(new Error('Unauthorized'));
      }

      const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
      if (!decoded?.id) {
        return next(new Error('Unauthorized'));
      }

      socket.data.userId = Number(decoded.id);
      socket.data.organizationId = Number(decoded.organizationId);
      socket.data.role = decoded.role;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    if (!Number.isFinite(userId)) {
      socket.disconnect(true);
      return;
    }

    const room = userRoom(userId);
    socket.join(room);
    socket.emit('session:ready', { userId });

    socket.on('disconnect', (reason) => {
      void reason;
    });
  });

  ioInstance = io;
  return io;
}

/** Per-user room for targeted emits (scalable: fan-out only to connected clients). */
export function userRoom(userId) {
  return `user:${userId}`;
}

export function getIO() {
  return ioInstance;
}

/**
 * Emit a notification payload to a user's room (call after persisting to DB).
 * @param {number} userId
 * @param {Record<string, unknown>} payload Serializable notification row
 */
export function emitNotification(userId, payload) {
  if (!ioInstance || !Number.isFinite(Number(userId))) {
    logger.warn('Socket emission skipped', {
      hasIoInstance: Boolean(ioInstance),
      userId,
    });
    return;
  }
  logger.debug('Emitting socket notification', {
    userId: Number(userId),
    type: payload.type,
  });
  ioInstance.to(userRoom(Number(userId))).emit('notification:new', payload);
}
