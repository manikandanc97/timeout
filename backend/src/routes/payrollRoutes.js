import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import {
  listPayroll,
  listMyPayslips,
  generatePayroll,
  updatePayrollWorkflowStatus,
  downloadPayslip,
} from '../controllers/payrollController.js';

import { validate } from '../middleware/validationMiddleware.js';
import {
  payrollGenerationSchema,
  updatePayrollStatusSchema,
} from '../validations/payrollSchemas.js';

const router = express.Router();

router.use(authMiddleware);

// Admin/Manager/HR Routes
router.get('/', roleMiddleware('ADMIN', 'MANAGER', 'HR'), listPayroll);
router.post('/generate', roleMiddleware('ADMIN', 'MANAGER'), validate(payrollGenerationSchema), generatePayroll);
router.patch('/:payrollId/status', roleMiddleware('ADMIN', 'MANAGER', 'HR'), validate(updatePayrollStatusSchema), updatePayrollWorkflowStatus);

// Common/Employee Routes
router.get('/my-payslips', listMyPayslips);
router.get('/:payrollId/pdf', downloadPayslip);

export default router;
