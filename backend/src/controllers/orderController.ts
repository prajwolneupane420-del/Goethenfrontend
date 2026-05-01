import Order from '../models/Order';
import User from '../models/User';
import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpayInstance: Razorpay | null = null;

const getRazorpay = () => {
  if (!razorpayInstance) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      throw new Error('Razorpay API keys are missing. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables.');
    }

    razorpayInstance = new Razorpay({
      key_id: key_id.trim(),
      key_secret: key_secret.trim(),
    });
  }
  return razorpayInstance;
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('items.product').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

export const createRazorpayOrder = async (req, res) => {
  const { items, totalAmount, shippingAddress, paymentMethod, amountToPay } = req.body;

  if (totalAmount === undefined || totalAmount < 0) {
    return res.status(400).json({ message: 'Invalid total amount' });
  }

  try {
    // Save address to user if no addresses exist
    if (shippingAddress) {
      const dbUser = await User.findById(req.user.id);
      if (dbUser && (!dbUser.addresses || dbUser.addresses.length === 0)) {
        dbUser.addresses = [{
          label: 'Home',
          street: shippingAddress.street || '',
          city: shippingAddress.city || '',
          state: shippingAddress.state || '',
          pincode: shippingAddress.zipCode || shippingAddress.pincode || '',
          isDefault: true
        }];
        await dbUser.save();
      }
    }

    // If it's COD and amountToPay is 0 (due to coupon), just create the order directly
    if (paymentMethod === 'cod' && amountToPay === 0) {
      const newOrder = await Order.create({
        user: req.user.id,
        items,
        totalAmount,
        shippingAddress,
        paymentStatus: 'cod',
        paymentMethod: 'cod',
      });
      return res.json({ orderId: newOrder._id, directSuccess: true });
    }

    if (paymentMethod === 'prepaid' && amountToPay === 0) {
      const newOrder = await Order.create({
        user: req.user.id,
        items,
        totalAmount,
        shippingAddress,
        paymentStatus: 'paid',
        paymentMethod: 'prepaid',
      });
      return res.json({ orderId: newOrder._id, directSuccess: true });
    }

    const payAmount = amountToPay || totalAmount;
    if (payAmount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    const razorpay = getRazorpay();
    const options = {
      amount: Math.round(payAmount * 100), // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const rzpOrder = await razorpay.orders.create(options);

    const newOrder = await Order.create({
      user: req.user.id,
      items,
      totalAmount,
      razorpayOrderId: rzpOrder.id,
      shippingAddress,
      paymentStatus: 'pending',
      paymentMethod: paymentMethod || 'prepaid',
    });

    res.json({ rzpOrder, orderId: newOrder._id });
  } catch (err: any) {
    console.error('Razorpay order creation error:', err);
    let errorMessage = err instanceof Error ? err.message : 'Error creating order';
    
    if (err && err.error && err.error.description) {
      errorMessage = err.error.description;
      if (err.error.code === 'BAD_REQUEST_ERROR' && errorMessage === 'Authentication failed') {
        errorMessage = 'Razorpay Authentication failed. Please ensure your Razorpay API keys are correct.';
      }
    }
    
    res.status(500).json({ message: errorMessage });
  }
};

export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  try {
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) throw new Error('RAZORPAY_KEY_SECRET is missing');

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", key_secret)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = order.paymentMethod === 'cod' ? 'cod' : 'paid';
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();
      }
      return res.json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature" });
    }
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.orderStatus = req.body.status || order.orderStatus;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating order' });
  }
};
