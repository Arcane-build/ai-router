import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  credits: number;
  createdAt: Date;
  lastLogin: Date;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  credits: {
    type: Number,
    default: 5000,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.model<IUser>('User', UserSchema);
