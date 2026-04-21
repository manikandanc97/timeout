import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import {
  listPayroll,
  listMyPayslips,
  markPayrollPaidBulk,
  markPayrollPaid,
} from '../controllers/payrollController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', roleMiddleware('ADMIN'), listPayroll);
router.get('/my-payslips', listMyPayslips);
router.patch('/mark-paid/bulk', roleMiddleware('ADMIN'), markPayrollPaidBulk);
router.patch('/:payrollId/mark-paid', roleMiddleware('ADMIN'), markPayrollPaid);

export default router;
