import { Router } from 'express';
import { body } from 'express-validator';
import {
  createCollection,
  listCollections,
  deleteCollection,
  listCollectionUrls,
} from '../controllers/collectionController.js';
import { getCollectionAnalytics } from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.use(authMiddleware);

const createValidation = [
  body('name').trim().isLength({ min: 1, max: 120 }).withMessage('name is required (max 120 chars)'),
];

router.post('/', createValidation, validateRequest, createCollection);
router.get('/', listCollections);
router.get('/:id/analytics', getCollectionAnalytics);
router.get('/:id/urls', listCollectionUrls);
router.delete('/:id', deleteCollection);

export default router;
