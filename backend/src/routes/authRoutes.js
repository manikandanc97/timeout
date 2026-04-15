import express from 'express';
import {
  register,
  login,
  refreshTokenHandler,
  logout,
  getCurrentUser,
  updateProfileName,
  changePassword,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshTokenHandler);
router.post('/logout', logout);
router.get('/me', authMiddleware, getCurrentUser);
router.patch('/me/name', authMiddleware, updateProfileName);
router.patch('/me/password', authMiddleware, changePassword);

export default router;
