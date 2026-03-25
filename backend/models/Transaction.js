import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: String,
  qty: Number,
  price: Number,
});

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  type: {
    type: String,
    required: true,
    enum: ['Buy', 'LenDen'],
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  payeeOrParty: {
    type: String,
    required: true,
  },
  // Buy specific fields
  category: String,
  subCategory: String,
  items: [itemSchema],
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending'],
  },
  method: {
    type: String,
    enum: ['Online', 'Cash'],
  },
  // LenDen specific fields
  lenDenType: {
    type: String,
    enum: ['I GAVE', 'I TOOK'],
  },
  notes: String,
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
