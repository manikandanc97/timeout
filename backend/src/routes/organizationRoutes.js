import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import {
  getOrganizationStructure,
  getOrganizationEmployees,
  getReportingManagerOptions,
  getOrganizationTeams,
  createOrganizationDepartment,
  updateOrganizationDepartment,
  deleteOrganizationDepartment,
  createOrganizationTeam,
  updateOrganizationTeam,
  deleteOrganizationTeam,
  createEmployeeUser,
  updateEmployeeUser,
  deleteEmployeeUser,
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
  '/reporting-manager-options',
  roleMiddleware('ADMIN'),
  getReportingManagerOptions,
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
router.patch(
  '/teams/:teamId',
  roleMiddleware('ADMIN'),
  updateOrganizationTeam,
);
router.delete(
  '/teams/:teamId',
  roleMiddleware('ADMIN'),
  deleteOrganizationTeam,
);
router.post('/employees', roleMiddleware('ADMIN'), createEmployeeUser);
router.patch(
  '/employees/:userId',
  roleMiddleware('ADMIN'),
  updateEmployeeUser,
);
router.delete(
  '/employees/:userId',
  roleMiddleware('ADMIN'),
  deleteEmployeeUser,
);

export default router;
