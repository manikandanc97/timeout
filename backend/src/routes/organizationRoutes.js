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
  getEmployeeDetails,
  upsertEmployeeSalaryStructure,
  getLeavePolicy,
  updateLeavePolicy,
  resetLeavePolicy,
  getAdminSettings,
  updateAdminSettings,
  resetAdminSettings,
  testSmtpConfiguration,
} from '../controllers/organizationController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/leave-policy', getLeavePolicy);
router.put('/leave-policy', roleMiddleware('ADMIN'), updateLeavePolicy);
router.post('/leave-policy/reset', roleMiddleware('ADMIN'), resetLeavePolicy);
router.get('/admin-settings', roleMiddleware('ADMIN'), getAdminSettings);
router.put('/admin-settings', roleMiddleware('ADMIN'), updateAdminSettings);
router.post('/admin-settings/reset', roleMiddleware('ADMIN'), resetAdminSettings);
router.post('/test-smtp', roleMiddleware('ADMIN'), testSmtpConfiguration);

router.get(
  '/structure',
  roleMiddleware('ADMIN', 'MANAGER'),
  getOrganizationStructure,
);
router.get(
  '/employees',
  roleMiddleware('ADMIN', 'MANAGER'),
  getOrganizationEmployees,
);
router.get(
  '/reporting-manager-options',
  roleMiddleware('ADMIN'),
  getReportingManagerOptions,
);
router.get(
  '/teams',
  roleMiddleware('ADMIN', 'MANAGER'),
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
router.get(
  '/employees/:userId/details',
  roleMiddleware('ADMIN', 'MANAGER'),
  getEmployeeDetails,
);
router.post(
  '/employees/:userId/salary-structure',
  roleMiddleware('ADMIN'),
  upsertEmployeeSalaryStructure,
);
router.delete(
  '/employees/:userId',
  roleMiddleware('ADMIN'),
  deleteEmployeeUser,
);

export default router;
