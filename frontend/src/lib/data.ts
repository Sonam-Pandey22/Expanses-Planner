export const categories = ['Food & drinks', 'Shopping', 'Transport', 'Housing', 'Entertainment', 'Health', 'Education', 'Travel', 'Salary', 'Freelance', 'Other'];
export const categoryColors: Record<string, string> = { 'Food & drinks': '#b6e5a1', Shopping: '#8cbdb5', Transport: '#b9a6d4', Housing: '#e7c58b', Entertainment: '#e4a6aa', Health: '#9cbce3', Education: '#d1ce8e', Travel: '#86cbd1', Salary: '#69ad88', Freelance: '#b4a3d0', Other: '#b0b8b0' };
export type Transaction = { _id: string; title: string; amount: number; type: 'income' | 'expense'; category: string; date: string; note: string };
export type Budget = { _id: string; category: string; limit: number; month: string };
export type Goal = { _id: string; title: string; target: number; saved: number };
export type Workspace = { transactions: Transaction[]; budgets: Budget[]; goals: Goal[] };
export type User = { id: string; name: string; email: string };
export function monthKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; }
export function today() { const d = new Date(); return `${monthKey(d)}-${String(d.getDate()).padStart(2, '0')}`; }
export function currency(value: number, compact = false) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: compact ? 0 : 2, minimumFractionDigits: 0, notation: compact ? 'compact' : 'standard' }).format(value); }
export function demoData(): Workspace {
  const transactions: Transaction[] = [];
  for (let offset = 5; offset >= 0; offset--) {
    const date = new Date(); date.setDate(1); date.setMonth(date.getMonth() - offset);
    const month = monthKey(date);
    const rows: [string, number, Transaction['type'], string, number][] = [
      ['Monthly salary', 85000, 'income', 'Salary', 1], ['Apartment rent', 18000, 'expense', 'Housing', 2],
      ['Weekly groceries', 2450 + offset * 80, 'expense', 'Food & drinks', 4], ['Metro recharge', 1200, 'expense', 'Transport', 5],
      ['Netflix subscription', 649, 'expense', 'Entertainment', 6], ['Freelance project', 12500 + offset * 500, 'income', 'Freelance', 9],
      ['New everyday essentials', 3299 + offset * 100, 'expense', 'Shopping', 12], ['Lunch with friends', 1850, 'expense', 'Food & drinks', 15],
      ['Design course', 2499, 'expense', 'Education', 17], ['Blue Tokai Coffee', 480, 'expense', 'Food & drinks', 21],
      ['Uber ride', 340, 'expense', 'Transport', 22], ['Weekend groceries', 2180, 'expense', 'Food & drinks', 23],
      ['Annual health check', 1500, 'expense', 'Health', 24], ['Nike running shoes', 4995, 'expense', 'Shopping', 25],
    ];
    for (const [i, [title, amount, type, category, day]] of rows.entries()) {
      if (offset === 0 && day > new Date().getDate()) continue;
      transactions.push({ _id: `demo-${offset}-${i}`, title, amount, type, category, date: `${month}-${String(day).padStart(2, '0')}`, note: '' });
    }
  }
  return {
    transactions,
    budgets: ['Food & drinks', 'Shopping', 'Transport', 'Entertainment'].map((category, i) => ({ _id: `budget-${i}`, category, limit: [10000, 10000, 4000, 2500][i], month: monthKey() })),
    goals: [{ _id: 'goal-1', title: 'Japan, here I come', target: 150000, saved: 96000 }, { _id: 'goal-2', title: 'Emergency fund', target: 300000, saved: 175000 }],
  };
}
export async function api<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(`/api${path}`, { method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) }).catch(() => { throw new Error('Unable to reach the API. Please check that the Express server and MongoDB are running.'); });
  const data = await response.json().catch(() => ({ error: 'The API is unavailable. Start the Express server and MongoDB.' }));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}
