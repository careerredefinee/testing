import express from 'express';
import * as courseController from '../controllers/courseController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import {
  uploadCourseImage,
  resizeCourseImage,
  uploadSyllabus,
  processSyllabus,
} from '../controllers/courseController.js';

const router = express.Router();

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/search', courseController.searchCourses);
router.get('/popular', courseController.getPopularCourses);
router.get('/:id', courseController.getCourse);

// Protected routes (require authentication)
router.use(protect);

// Enroll in a course
router.post('/:id/enroll', courseController.enrollInCourse);

// Instructor and Admin routes
router.use(restrictTo('instructor', 'admin'));

// Course CRUD operations
router
  .route('/')
  .post(
    uploadCourseImage,
    resizeCourseImage,
    uploadSyllabus,
    processSyllabus,
    courseController.createCourse
  );

router
  .route('/:id')
  .patch(
    uploadCourseImage,
    resizeCourseImage,
    uploadSyllabus,
    processSyllabus,
    courseController.updateCourse
  )
  .delete(courseController.deleteCourse);

export default router;
