import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  listPayroll,
  listMyPayslips,
  markPayrollPaidBulk,
  markPayrollPaid,
} from '../controllers/payrollController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', listPayroll);
router.get('/my-payslips', listMyPayslips);
router.patch('/mark-paid/bulk', markPayrollPaidBulk);
router.patch('/:payrollId/mark-paid', markPayrollPaid);

export default router;
