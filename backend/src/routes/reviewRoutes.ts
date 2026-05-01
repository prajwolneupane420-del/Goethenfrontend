import express from 'express';
import { getProductReviews, createReview, createFakeReview } from '../controllers/reviewController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/:productId', getProductReviews);
router.post('/', protect, createReview);
router.post('/fake', protect, admin, createFakeReview);

export default router;
