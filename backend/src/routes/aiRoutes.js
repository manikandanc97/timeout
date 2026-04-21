import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  handleChat,
  getSettings,
  updateSettings,
  testAI,
  getAuditLogsController,
  reindexKnowledgeBase,
} from '../controllers/aiController.js';

const router = Router();

// All AI routes require authentication
router.use(authMiddleware);

// Chat endpoint — main conversational loop
router.post('/chat', handleChat);

// Settings endpoints (admin only — enforced in controller)
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.post('/settings/test', testAI);

// Audit log viewer (admin only — enforced in controller)
router.get('/audit-logs', getAuditLogsController);

// Knowledge management (admin only)
router.post('/knowledge/reindex', reindexKnowledgeBase);

export default router;
