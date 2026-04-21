import express from 'express';
import {
  applyLeave,
  applyCompOffCredit,
  getCompOffRequests,
  applyPermissionRequest,
  getPermissionRequests,
  getPermissionSummary,
  getLeaves,
  updateCompOffRequestStatus,
  updateLeaveStatus,
  updatePermissionRequestStatus,
  getDashboardStats,
  cancelLeave,
} from '../controllers/leaveController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

import { validate } from '../middleware/validationMiddleware.js';
import {
  leaveSchema,
  compOffSchema,
  permissionSchema,
  updateRequestStatusSchema,
  updateSimpleStatusSchema,
} from '../validations/leaveSchemas.js';

const router = express.Router();

router.get('/dashboard', authMiddleware, getDashboardStats);
router.get('/history', authMiddleware, getLeaves);

router.post('/', authMiddleware, validate(leaveSchema), applyLeave);
router.post(
  '/comp-off-credit',
  authMiddleware,
  validate(compOffSchema),
  applyCompOffCredit,
);
router.post(
  '/permissions',
  authMiddleware,
  validate(permissionSchema),
  applyPermissionRequest,
);
router.get('/permissions/summary', authMiddleware, getPermissionSummary);
router.get('/permissions/requests', authMiddleware, getPermissionRequests);
router.put(
  '/permissions/requests/:id',
  authMiddleware,
  roleMiddleware('MANAGER', 'ADMIN'),
  validate(updateSimpleStatusSchema),
  updatePermissionRequestStatus,
);
router.get('/comp-off-requests', authMiddleware, getCompOffRequests);
router.put(
  '/comp-off-requests/:id',
  authMiddleware,
  roleMiddleware('MANAGER', 'ADMIN'),
  validate(updateSimpleStatusSchema),
  updateCompOffRequestStatus,
);
router.get('/', authMiddleware, getLeaves);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('MANAGER', 'ADMIN'),
  validate(updateRequestStatusSchema),
  updateLeaveStatus,
);

router.delete('/:id', authMiddleware, cancelLeave);

export default router;
