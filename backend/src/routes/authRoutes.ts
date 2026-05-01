import express from 'express';
import { sendOTP, verifyOTP, getMe, logout, adminLogin, registerUser, loginUser, resetPassword } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/otp/send', sendOTP);
router.post('/otp/verify', verifyOTP);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/reset-password', resetPassword);
router.post('/admin/login', adminLogin);
router.get('/me', protect, getMe);
router.post('/logout', logout);

export default router;
