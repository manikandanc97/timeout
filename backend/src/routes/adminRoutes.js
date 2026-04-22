import express from 'express';
import {
  getAdminCompOffRequests,
  getAdminDashboardData,
  getAdminPermissionRequests,
} from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get(
  '/stats',
  authMiddleware,
  roleMiddleware('ADMIN', 'MANAGER', 'HR'),
  getAdminDashboardData,
);
router.get(
  '/permission-requests',
  authMiddleware,
  roleMiddleware('ADMIN', 'MANAGER', 'HR'),
  getAdminPermissionRequests,
);
router.get(
  '/comp-off-requests',
  authMiddleware,
  roleMiddleware('ADMIN', 'MANAGER', 'HR'),
  getAdminCompOffRequests,
);

export default router;
