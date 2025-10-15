import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  health,
  chat,
  generateCode,
  analyzeDocument,
  generateImage,
  generateMusic,
  generateVideo,
} from '../controllers/aiController.js';

const router = express.Router();

// Public health endpoint
router.get('/health', health);

// Require auth for AI usage to prevent abuse
router.use(protect);

router.post('/chat', chat);
router.post('/code', generateCode);
router.post('/document', analyzeDocument);
router.post('/image', generateImage);
router.post('/music', generateMusic);
router.post('/video', generateVideo);

export default router;
