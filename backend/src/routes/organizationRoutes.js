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

import { validate } from '../middleware/validationMiddleware.js';
import {
  departmentSchema,
  teamSchema,
  employeeCreateSchema,
  employeeUpdateSchema,
  salaryStructureSchema,
  leavePolicySchema,
  adminSettingsSchema,
  testSmtpSchema,
} from '../validations/organizationSchemas.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/leave-policy', getLeavePolicy);
router.put('/leave-policy', roleMiddleware('ADMIN'), validate(leavePolicySchema), updateLeavePolicy);
router.post('/leave-policy/reset', roleMiddleware('ADMIN'), resetLeavePolicy);
router.get('/admin-settings', roleMiddleware('ADMIN'), getAdminSettings);
router.put('/admin-settings', roleMiddleware('ADMIN'), validate(adminSettingsSchema), updateAdminSettings);
router.post('/admin-settings/reset', roleMiddleware('ADMIN'), resetAdminSettings);
router.post('/test-smtp', roleMiddleware('ADMIN'), validate(testSmtpSchema), testSmtpConfiguration);

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
  validate(departmentSchema),
  createOrganizationDepartment,
);
router.patch(
  '/departments/:departmentId',
  roleMiddleware('ADMIN'),
  validate(departmentSchema),
  updateOrganizationDepartment,
);
router.delete(
  '/departments/:departmentId',
  roleMiddleware('ADMIN'),
  deleteOrganizationDepartment,
);
router.post(
  '/teams',
  roleMiddleware('ADMIN'),
  validate(teamSchema),
  createOrganizationTeam,
);
router.patch(
  '/teams/:teamId',
  roleMiddleware('ADMIN'),
  validate(teamSchema),
  updateOrganizationTeam,
);
router.delete(
  '/teams/:teamId',
  roleMiddleware('ADMIN'),
  deleteOrganizationTeam,
);
router.post(
  '/employees',
  roleMiddleware('ADMIN'),
  validate(employeeCreateSchema),
  createEmployeeUser,
);
router.patch(
  '/employees/:userId',
  roleMiddleware('ADMIN'),
  validate(employeeUpdateSchema),
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
  validate(salaryStructureSchema),
  upsertEmployeeSalaryStructure,
);
router.delete(
  '/employees/:userId',
  roleMiddleware('ADMIN'),
  deleteEmployeeUser,
);

export default router;
