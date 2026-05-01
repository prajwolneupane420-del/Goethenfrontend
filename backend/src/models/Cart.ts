import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, default: 0 }
}, { timestamps: true });

export interface ICart extends mongoose.Document {
  user: mongoose.Schema.Types.ObjectId;
  items: any[];
  totalAmount: number;
}

export default mongoose.model<ICart>('Cart', CartSchema);
