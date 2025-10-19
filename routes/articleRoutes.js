import express from 'express';
import * as articleController from '../controllers/articleController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import {
  uploadArticleImage,
  resizeArticleImage,
} from '../controllers/articleController.js';

const router = express.Router();

// Public routes
router.get('/', articleController.getAllArticles);
router.get('/featured', articleController.getFeaturedArticles);
router.get('/tag/:tag', articleController.getArticlesByTag);
router.get('/search', articleController.searchArticles);
router.get('/:id', articleController.getArticle);

// Protected routes (require authentication)
router.use(protect);

// Author and Admin routes
router.use(restrictTo('author', 'admin'));

// Article CRUD operations
router
  .route('/')
  .post(
    uploadArticleImage,
    resizeArticleImage,
    articleController.createArticle
  );

router
  .route('/:id')
  .patch(
    uploadArticleImage,
    resizeArticleImage,
    articleController.updateArticle
  )
  .delete(articleController.deleteArticle);

export default router;
