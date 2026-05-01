import express from 'express';
import { getCoupons, getCouponByCode, createCoupon, updateCoupon, deleteCoupon } from '../controllers/couponController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/code/:code', getCouponByCode); // Public can fetch by code to validate

// Admin routes
router.get('/', protect, admin, getCoupons);
router.post('/', protect, admin, createCoupon);
router.put('/:id', protect, admin, updateCoupon);
router.delete('/:id', protect, admin, deleteCoupon);

export default router;
