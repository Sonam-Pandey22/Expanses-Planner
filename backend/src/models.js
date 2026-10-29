import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
}, { timestamps: true });
const transactionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true, min: 0.01 },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  note: { type: String, default: '' },
}, { timestamps: true });
transactionSchema.index({ user: 1, date: -1 });
const budgetSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  limit: { type: Number, min: 1, required: true },
  month: { type: String, required: true },
}, { timestamps: true });
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });
const goalSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  target: { type: Number, min: 1, required: true },
  saved: { type: Number, min: 0, default: 0 },
}, { timestamps: true });
export const User = model('User', userSchema);
export const Transaction = model('Transaction', transactionSchema);
export const Budget = model('Budget', budgetSchema);
export const Goal = model('Goal', goalSchema);
