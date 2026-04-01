import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  qty: { type: Number, default: 1 },
  price: { type: Number, required: true }
});

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  calendarId: { type: mongoose.Schema.Types.ObjectId, ref: 'Calendar', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  time: { type: String }, // Format: HH:MM AM/PM
  type: { type: String, enum: ['Buy', 'LenDen'], required: true },
  
  // Fields for 'Buy' type
  payeeName: { type: String },
  category: { type: String },
  subCategory: { type: String },
  paymentStatus: { type: String, enum: ['Paid', 'Pending'] },
  paymentMethod: { type: String, enum: ['Online', 'Cash'] },
  items: [itemSchema],
  
  // Fields for 'LenDen' type
  lenDenType: { type: String, enum: ['I GAVE', 'I TOOK'] },
  partyName: { type: String },
  notes: { type: String },
  
  // Common fields
  totalAmount: { type: Number, required: true, default: 0 },
}, {
  timestamps: true
});

const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
export default Expense;
