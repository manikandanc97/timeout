import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { postAiChat } from '../controllers/aiChatController.js';

const router = express.Router();

router.use(authMiddleware);
router.post('/chat', postAiChat);

export default router;
