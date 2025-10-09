import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { uploadReviewImages, processReviewImages } from '../controllers/reviewController.js';

const router = express.Router({ mergeParams: true });

// Public routes
router.get('/', reviewController.getAllReviews);
router.get('/course/:courseId', reviewController.getCourseReviews);
router.get('/user/:userId', reviewController.getUserReviews);
router.get('/:id', reviewController.getReview);

// Protected routes (require authentication)
router.use(protect);

// User routes
router.post(
  '/',
  uploadReviewImages,
  processReviewImages,
  reviewController.createReview
);

router
  .route('/:id')
  .patch(
    uploadReviewImages,
    processReviewImages,
    reviewController.updateReview
  )
  .delete(reviewController.deleteReview);

// Admin routes
router.use(restrictTo('admin'));

// Admin can manage all reviews
router.get('/admin/all', reviewController.getAllReviews);

export default router;
