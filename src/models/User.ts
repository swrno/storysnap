import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
