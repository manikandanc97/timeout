import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import {
  getOrganizationStructure,
  createEmployeeUser,
} from '../controllers/organizationController.js';

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/structure',
  roleMiddleware('ADMIN', 'MANAGER'),
  getOrganizationStructure,
);
router.post('/employees', roleMiddleware('ADMIN'), createEmployeeUser);

export default router;
