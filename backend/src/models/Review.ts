import mongoose from 'mongoose';

export interface IReview extends mongoose.Document {
  product: mongoose.Schema.Types.ObjectId;
  user?: mongoose.Schema.Types.ObjectId;
  fakeName?: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fakeName: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Review = mongoose.model<IReview>('Review', ReviewSchema);
export default Review;
