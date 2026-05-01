import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import productRoutes from './routes/productRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';
import reviewRoutes from './routes/reviewRoutes';
import couponRoutes from './routes/couponRoutes';

const app = express();

// Basic Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);

export default app;
// 🔥 Global Error Handler (MUST HAVE)
app.use((err: any, req: any, res: any, next: any) => {
  console.error("🔥 GLOBAL ERROR:", err);
  res.status(500).json({ message: "Internal Server Error" });
});
