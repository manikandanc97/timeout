import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import {
  getOrganizationStructure,
  getOrganizationEmployees,
  getOrganizationTeams,
  createOrganizationDepartment,
  updateOrganizationDepartment,
  deleteOrganizationDepartment,
  createOrganizationTeam,
  createEmployeeUser,
  getLeavePolicy,
  updateLeavePolicy,
  resetLeavePolicy,
} from '../controllers/organizationController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/leave-policy', getLeavePolicy);
router.put('/leave-policy', roleMiddleware('ADMIN'), updateLeavePolicy);
router.post('/leave-policy/reset', roleMiddleware('ADMIN'), resetLeavePolicy);

router.get(
  '/structure',
  roleMiddleware('ADMIN', 'MANAGER', 'HR'),
  getOrganizationStructure,
);
router.get(
  '/employees',
  roleMiddleware('ADMIN', 'MANAGER', 'HR'),
  getOrganizationEmployees,
);
router.get(
  '/teams',
  roleMiddleware('ADMIN', 'MANAGER', 'HR'),
  getOrganizationTeams,
);
router.post(
  '/departments',
  roleMiddleware('ADMIN'),
  createOrganizationDepartment,
);
router.patch(
  '/departments/:departmentId',
  roleMiddleware('ADMIN'),
  updateOrganizationDepartment,
);
router.delete(
  '/departments/:departmentId',
  roleMiddleware('ADMIN'),
  deleteOrganizationDepartment,
);
router.post('/teams', roleMiddleware('ADMIN'), createOrganizationTeam);
router.post('/employees', roleMiddleware('ADMIN'), createEmployeeUser);

export default router;
