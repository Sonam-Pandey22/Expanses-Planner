import { z } from 'zod';
export const categories = ['Food & drinks', 'Shopping', 'Transport', 'Housing', 'Entertainment', 'Health', 'Education', 'Travel', 'Salary', 'Freelance', 'Other'];
const money = z.number().finite().positive().max(100000000).refine(n => Math.abs(Math.round(n * 100) - n * 100) < 0.00001, 'Use at most two decimal places');
export const transactionInput = z.object({
  title: z.string().trim().min(1).max(100), amount: money,
  type: z.enum(['income', 'expense']), category: z.enum(categories),
  date: z.iso.date(), note: z.string().trim().max(500).default(''),
});
export const budgetInput = z.object({ category: z.enum(categories), limit: money, month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/) });
export const goalInput = z.object({ title: z.string().trim().min(1).max(100), target: money, saved: z.number().finite().min(0).max(100000000) }).refine(v => v.saved <= v.target, 'Saved amount cannot exceed the goal');
export const registerInput = z.object({ name: z.string().trim().min(2).max(60), email: z.email().trim().toLowerCase().max(254), password: z.string().min(8).max(72) });
export const loginInput = registerInput.omit({ name: true });
