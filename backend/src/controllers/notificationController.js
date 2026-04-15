import prisma from '../prismaClient.js';
import { toNotificationPayload } from '../services/notificationService.js';

const DEFAULT_TAKE = 50;

/** DB migration not applied yet, or table missing (e.g. drift). */
function isNotificationsUnavailable(error) {
  const code = error?.code;
  if (code === 'P2021' || code === 'P2010') return true;
  const msg = String(error?.message ?? '');
  return (
    msg.includes('Notification') &&
    (msg.includes('does not exist') || msg.includes('Unknown model'))
  );
}

export const listNotifications = async (req, res) => {
  try {
    const take = Math.min(
      Math.max(Number(req.query.take) || DEFAULT_TAKE, 1),
      100,
    );

    const items = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, readAt: null },
    });

    res.json({
      items: items.map(toNotificationPayload),
      unreadCount,
    });
  } catch (error) {
    if (isNotificationsUnavailable(error)) {
      return res.json({ items: [], unreadCount: 0 });
    }
    console.error('[notifications] list', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid notification id' });
    }

    const existing = await prisma.notification.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, readAt: null },
    });

    res.json({
      notification: toNotificationPayload(updated),
      unreadCount,
    });
  } catch (error) {
    if (isNotificationsUnavailable(error)) {
      return res.status(503).json({
        message: 'Notifications are not available until the database migration is applied.',
      });
    }
    console.error('[notifications] mark read', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, readAt: null },
      data: { readAt: new Date() },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, readAt: null },
    });

    res.json({ unreadCount });
  } catch (error) {
    if (isNotificationsUnavailable(error)) {
      return res.json({ unreadCount: 0 });
    }
    console.error('[notifications] mark all read', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
