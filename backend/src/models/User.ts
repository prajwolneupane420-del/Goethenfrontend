import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, default: 'Street Legend' },
  email: { type: String },
  password: { type: String },
  phone: { type: String, unique: true, required: true },
  otp: { type: String },
  otpExpires: { type: Date },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  addresses: [{
    label: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: { type: Boolean, default: false },
  }],
}, { timestamps: true });

UserSchema.index(
  { email: 1 },
  { 
    unique: true, 
    sparse: true, 
    background: true,
    name: 'email_unique_partial',
    partialFilterExpression: { email: { $type: "string" } } 
  }
);

export interface IUser extends mongoose.Document {
  name: string;
  email?: string;
  password?: string;
  phone: string;
  otp?: string;
  otpExpires?: Date;
  role: 'user' | 'admin';
  addresses: Array<{
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }>;
}

export default mongoose.model<IUser>('User', UserSchema);
