import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  skuId: { type: String },
  description: { type: String, required: true },
  category: { type: String, enum: ['Anime', 'Superhero', 'Limited', 'Hoodies', 'T-Shirts', 'Jackets', 'Accessories'], required: true },
  basePrice: { type: Number, required: true }, // The discounted price e.g. 1599
  originalPrice: { type: Number }, // To show strikethrough price e.g. 2799
  discountPercentage: { type: Number }, // e.g. 43
  collectionName: { type: String, default: 'EPIC THREAD COLLECTION' },
  rating: { type: Number, default: 4.9 },
  reviewsCount: { type: Number, default: 11 },
  colors: [{ type: String }], // Array of color hex codes
  discountPrice: { type: Number }, // Not strictly needed if use original/base but keeping for backwards compatibility
  images: [String],
  variants: [{
    size: { type: String, enum: ['S', 'M', 'L', 'XL'], required: true },
    color: String,
    stock: { type: Number, default: 0 },
    sku: String,
  }],
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

export interface IProduct extends mongoose.Document {
  title: string;
  skuId?: string;
  description: string;
  category: string;
  basePrice: number;
  originalPrice?: number;
  discountPercentage?: number;
  collectionName: string;
  rating: number;
  reviewsCount: number;
  colors: string[];
  discountPrice?: number;
  images: string[];
  variants: any[];
  isFeatured: boolean;
}

export default mongoose.model<IProduct>('Product', ProductSchema);
