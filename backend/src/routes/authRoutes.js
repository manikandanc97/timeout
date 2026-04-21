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

import { validate } from '../middleware/validationMiddleware.js';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileNameSchema,
} from '../validations/authSchemas.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshTokenHandler);
router.post('/logout', logout);
router.get('/me', authMiddleware, getCurrentUser);
router.patch('/me/name', authMiddleware, validate(updateProfileNameSchema), updateProfileName);
router.patch('/me/password', authMiddleware, validate(changePasswordSchema), changePassword);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

export default router;
