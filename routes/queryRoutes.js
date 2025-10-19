import express from 'express';
import * as queryController from '../controllers/queryController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Public route for submitting queries
router.post('/', queryController.createQuery);

// Protected routes (require authentication)
router.use(protect);

// User routes
router.get('/my-queries', queryController.getMyQueries);
router.get('/:id', queryController.getQuery);

// Admin routes
router.use(restrictTo('admin'));

router.get('/', queryController.getAllQueries);
router.get('/stats/query-stats', queryController.getQueryStats);
router.patch('/:id/status', queryController.updateQueryStatus);
router.post('/:id/reply', queryController.replyToQuery);
router.delete('/:id', queryController.deleteQuery);

export default router;
