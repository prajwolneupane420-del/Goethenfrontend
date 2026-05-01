import express from 'express';
import { getMyOrders, createRazorpayOrder, verifyPayment } from '../controllers/orderController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/create', protect, createRazorpayOrder);
router.get('/my-orders', protect, getMyOrders);
router.post('/verify', protect, verifyPayment);

export default router;
