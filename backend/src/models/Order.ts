import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    size: String,
    price: Number,
  }],
  totalAmount: Number,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'cod'], default: 'pending' },
  paymentMethod: { type: String, enum: ['prepaid', 'cod'], default: 'prepaid' },
  orderStatus: { type: String, enum: ['processing', 'shipped', 'delivered', 'cancelled'], default: 'processing' },
  shippingAddress: Object,
}, { timestamps: true });

export interface IOrder extends mongoose.Document {
  user: mongoose.Schema.Types.ObjectId | any;
  items: any[];
  totalAmount: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  paymentStatus: string;
  paymentMethod: string;
  orderStatus: string;
  shippingAddress: any;
}

export default mongoose.model<IOrder>('Order', OrderSchema);
