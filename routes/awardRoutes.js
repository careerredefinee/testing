import express from 'express';
import * as awardController from '../controllers/awardController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import {
  uploadAwardImage,
  resizeAwardImage,
} from '../controllers/awardController.js';

const router = express.Router();

// Public routes
router.get('/', awardController.getAllAwards);
router.get('/featured', awardController.getFeaturedAwards);
router.get('/category/:category', awardController.getAwardsByCategory);
router.get('/:id', awardController.getAward);

// Protected routes (require authentication)
router.use(protect);

// Admin routes
router.use(restrictTo('admin'));

// Award CRUD operations
router
  .route('/')
  .post(
    uploadAwardImage,
    resizeAwardImage,
    awardController.createAward
  );

router
  .route('/:id')
  .patch(
    uploadAwardImage,
    resizeAwardImage,
    awardController.updateAward
  )
  .delete(awardController.deleteAward);

export default router;
