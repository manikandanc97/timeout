import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import {
  listHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from '../controllers/holidayController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', listHolidays);
router.post('/', roleMiddleware('ADMIN'), createHoliday);
router.patch('/:id', roleMiddleware('ADMIN'), updateHoliday);
router.delete('/:id', roleMiddleware('ADMIN'), deleteHoliday);

export default router;
