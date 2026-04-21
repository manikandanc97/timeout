import express from 'express';
import {
  register,
  login,
  refreshTokenHandler,
  logout,
  getCurrentUser,
  updateProfileName,
  changePassword,
  forgotPassword,
  resetPassword,
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
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
