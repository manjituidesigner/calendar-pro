import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetOtp: {
    type: String,
  },
  resetOtpExpires: {
    type: Date,
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
