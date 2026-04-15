import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', authMiddleware, listNotifications);
router.post('/read-all', authMiddleware, markAllNotificationsRead);
router.patch('/:id/read', authMiddleware, markNotificationRead);

export default router;
