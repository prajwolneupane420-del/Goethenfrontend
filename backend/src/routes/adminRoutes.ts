import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import { getStats, getAdminOrders, updateProduct, deleteProduct, updateBanner } from '../controllers/adminController';
import { updateOrderStatus } from '../controllers/orderController';
import { createProduct } from '../controllers/productController';
import Banner from '../models/Banner';

const router = express.Router();

// Public Banner Route (Normally put in standard routes, but fast access here)
// Actually wait, 'router.use(protect, admin)' is below! So this works:
router.get('/banner', async (req, res) => {
  try {
    let banner = await Banner.findOne();
    if (!banner) {
      banner = await Banner.create({ images: ['https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=2574&auto=format&fit=crop'] });
    }
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching banner' });
  }
});

// Middleware to ensure all routes here are admin only
router.use(protect, admin);

router.put('/banner', updateBanner);

// Dashboard Statistics
router.get('/stats', getStats);

// Orders Management
router.get('/orders', getAdminOrders);
router.patch('/orders/:id/status', updateOrderStatus);

// Product Management (CRUD)
router.post('/products', createProduct);
router.patch('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

export default router;
