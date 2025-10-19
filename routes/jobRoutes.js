import express from 'express';
import * as jobController from '../controllers/jobController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { uploadJobLogo, resizeJobLogo } from '../controllers/jobController.js';

const router = express.Router();

// Public routes
router.get('/', jobController.getAllJobs);
router.get('/featured', jobController.getFeaturedJobs);
router.get('/employer/:employerId', jobController.getJobsByEmployer);
router.get('/:id', jobController.getJob);

// Protected routes (require authentication)
router.use(protect);

// Apply for job (authenticated users)
router.post('/:id/apply', jobController.applyForJob);

// Employer and Admin routes
router.use(restrictTo('employer', 'admin'));

// Job CRUD operations
router
  .route('/')
  .post(
    uploadJobLogo,
    resizeJobLogo,
    jobController.createJob
  );

router
  .route('/:id')
  .patch(
    uploadJobLogo,
    resizeJobLogo,
    jobController.updateJob
  )
  .delete(jobController.deleteJob);

export default router;
