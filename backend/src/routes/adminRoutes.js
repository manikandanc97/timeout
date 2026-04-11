import express from 'express';
import { getAdminDashboardData } from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get(
  '/stats',
  authMiddleware,
  roleMiddleware('ADMIN'),
  getAdminDashboardData,
);

export default router;
