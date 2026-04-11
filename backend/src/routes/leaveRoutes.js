import express from 'express';
import {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
  getDashboardStats,
  cancelLeave,
} from '../controllers/leaveController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/dashboard', authMiddleware, getDashboardStats);
router.get('/history', authMiddleware, getLeaves);

router.post('/', authMiddleware, applyLeave);
router.get('/', authMiddleware, getLeaves);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('MANAGER', 'ADMIN'),
  updateLeaveStatus,
);

router.delete('/:id', authMiddleware, cancelLeave);

export default router;
