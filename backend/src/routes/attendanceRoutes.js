import express from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import {
  punchIn,
  punchOut,
  getMyAttendance,
  getTodayStatus,
  requestRegularization,
  getRegularizationRequests,
  updateRegularizationStatus,
  getTeamAttendance,
} from '../controllers/attendanceController.js';

const router = express.Router();

// ─── Validation schemas ───────────────────────────────────────────────────────

const regularizationSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  requestedCheckIn: z.string().datetime({ offset: true }).optional().nullable(),
  requestedCheckOut: z.string().datetime({ offset: true }).optional().nullable(),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(500),
});

const updateRegularizationStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().max(500).optional(),
}).refine(data => {
  if (data.status === 'REJECTED' && !data.rejectionReason?.trim()) return false;
  return true;
}, { message: 'Rejection reason is required when rejecting', path: ['rejectionReason'] });

// ─── Routes ───────────────────────────────────────────────────────────────────

// Self-service (all authenticated roles)
router.post('/punch-in', authMiddleware, punchIn);
router.post('/punch-out', authMiddleware, punchOut);
router.get('/today', authMiddleware, getTodayStatus);
router.get('/history', authMiddleware, getMyAttendance);
router.post('/regularize', authMiddleware, validate(regularizationSchema), requestRegularization);
router.get('/regularize', authMiddleware, getRegularizationRequests);

// Manager + Admin approval
router.put(
  '/regularize/:id',
  authMiddleware,
  roleMiddleware('MANAGER', 'ADMIN'),
  validate(updateRegularizationStatusSchema),
  updateRegularizationStatus,
);

// Manager + Admin team view
router.get(
  '/team',
  authMiddleware,
  roleMiddleware('MANAGER', 'ADMIN'),
  getTeamAttendance,
);

export default router;
