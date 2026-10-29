import type { Metadata } from 'next';
import Planner from '@/components/planner';
export const metadata: Metadata = { title: 'Your dashboard · Expanse' };
export default function Dashboard() { return <Planner />; }
