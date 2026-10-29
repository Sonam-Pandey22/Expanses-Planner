import type { Metadata } from 'next';
import AuthPage from '@/components/auth-page';
export const metadata: Metadata = { title: 'Log in · Expanse', description: 'Welcome back. Sign in to your personal Expanse workspace.' };
export default function Login() { return <AuthPage mode="login" />; }
