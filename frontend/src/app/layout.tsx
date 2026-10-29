import type { Metadata } from 'next';
import ThemeProvider from '@/components/theme-provider';
import './globals.css';
import './public.css';
import './themes.css';
export const metadata: Metadata = {
  title: 'Expanse — A little clarity. A lot more possibility.',
  description: 'Your money, beautifully organized. Track expenses, build better budgets, and make room for what matters.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: "try{document.documentElement.dataset.theme=localStorage.getItem('expanse-dark')==='true'?'dark':'light'}catch{document.documentElement.dataset.theme='light'}" }} /></head><body><ThemeProvider>{children}</ThemeProvider></body></html>;
}
