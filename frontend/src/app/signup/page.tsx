import type { Metadata } from 'next';
import AuthPage from '@/components/auth-page';
export const metadata: Metadata = { title: 'Create an account · Expanse', description: 'Start a calmer relationship with your money. Create your personal Expanse account.' };
export default function Signup() { return <AuthPage mode="signup" />; }
