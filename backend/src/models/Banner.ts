import mongoose, { Document, Schema } from 'mongoose';

export interface IBanner extends Document {
  images: string[];
  title?: string;
  subtitle?: string;
}

const BannerSchema: Schema = new Schema({
  images: { type: [String], default: [] },
  title: { type: String, default: 'SUPREME' },
  subtitle: { type: String, default: 'Edition' }
}, {
  timestamps: true
});

export default mongoose.model<IBanner>('Banner', BannerSchema);
