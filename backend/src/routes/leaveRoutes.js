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

router.post('/', authMiddleware, applyLeave);
router.get('/', authMiddleware, getLeaves);
router.delete('/:id', authMiddleware, cancelLeave);
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('MANAGER', 'ADMIN'),
  updateLeaveStatus,
);

router.get('/dashboard', authMiddleware, getDashboardStats);
router.get('/history', authMiddleware, getLeaves);

export default router;
