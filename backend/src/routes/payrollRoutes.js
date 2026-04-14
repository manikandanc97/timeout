import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  generatePayrollSlipBulk,
  generatePayrollSlip,
  listPayroll,
  markPayrollPaidBulk,
  markPayrollPaid,
} from '../controllers/payrollController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', listPayroll);
router.post('/generate-slip/bulk', generatePayrollSlipBulk);
router.patch('/mark-paid/bulk', markPayrollPaidBulk);
router.post('/:payrollId/generate-slip', generatePayrollSlip);
router.patch('/:payrollId/mark-paid', markPayrollPaid);

export default router;
