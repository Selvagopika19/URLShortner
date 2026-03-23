import { Router } from 'express';
import { body } from 'express-validator';
import { createUrl, listUrls, deleteUrl } from '../controllers/urlController.js';
import { getUrlAnalytics } from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

// All URL routes require authentication
router.use(authMiddleware);

const createValidation = [
  body('originalUrl').trim().notEmpty().withMessage('originalUrl is required'),
  body('collectionId').optional().isMongoId().withMessage('collectionId must be a valid id'),
];

// Order: static paths before param routes
router.get('/', listUrls);
router.post('/', createValidation, validateRequest, createUrl);
router.get('/:id/analytics', getUrlAnalytics);
router.delete('/:id', deleteUrl);

export default router;
