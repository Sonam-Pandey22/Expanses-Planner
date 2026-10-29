'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Leaf, LockKeyhole, ShieldCheck, Sparkles, Target } from 'lucide-react';
import { Brand } from './public-nav';
import ThemeToggle from './theme-toggle';
import { api, type User } from '@/lib/data';

export default function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const signup = mode === 'signup';
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    api<{ user: User }>('/auth/me').then(() => { if (active) router.replace('/dashboard'); }).catch(() => {}).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [router]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const form = new FormData(event.currentTarget);
    if (signup && form.get('password') !== form.get('confirmPassword')) { setError('Your passwords don’t match. Please try again.'); return; }
    setBusy(true);
    try {
      await api(`/auth/${signup ? 'register' : 'login'}`, 'POST', { ...(signup ? { name: form.get('name') } : {}), email: form.get('email'), password: form.get('password') });
      router.replace('/dashboard'); router.refresh();
    } catch (e) { setError((e as Error).message); setBusy(false); }
  }
  return <main className="auth-page"><section className="auth-story"><Brand /><div className="auth-story-content"><span className="public-eyebrow"><Sparkles size={14} />YOUR NEXT CHAPTER STARTS HERE</span><h1>A little clarity.<br />A lot more<br /><span>possibility.</span><Leaf size={46} strokeWidth={1.1} /></h1><p>Less time worrying about money.<br />More room for the life you want to live.</p><div className="auth-goal-visual"><div className="auth-visual-top"><span><Target size={24} /></span><span>THE THINGS THAT MATTER</span><Sparkles size={19} /></div><h3>A future worth saving for.</h3><p>Every small step counts.</p><div className="auth-visual-amount"><strong>₹96,000</strong><span>of ₹1,50,000</span></div><div className="auth-visual-progress"><span /></div><div className="auth-visual-footer"><span>64% of the way there</span><span><Check size={13} />Looking forward</span></div><span className="auth-example">ILLUSTRATIVE SAVINGS GOAL</span></div></div><div className="auth-story-footer"><Leaf size={17} />Made for your everyday.</div></section><section className="auth-form-side"><div className="auth-page-toolbar"><Link className="auth-back" href="/"><ArrowLeft size={17} />Back to home</Link><ThemeToggle /></div><div className="auth-form-wrapper"><div className="auth-mobile-brand"><Brand /></div><span className="auth-welcome-icon">{signup ? <Sparkles size={25} /> : <LockKeyhole size={25} />}</span><span className="public-eyebrow">{signup ? 'A FRESH START, JUST FOR YOU' : 'GOOD TO HAVE YOU HERE'}</span><h2>{signup ? 'Make yourself at home.' : 'Welcome back.'}</h2><p className="auth-form-description">{signup ? 'Create your account. Find a little more financial peace of mind.' : 'Your plans, progress, and possibilities are waiting.'}</p><div className="auth-mode-tabs"><Link className={!signup ? 'selected' : ''} href="/login" aria-current={!signup ? 'page' : undefined}>Log in</Link><Link className={signup ? 'selected' : ''} href="/signup" aria-current={signup ? 'page' : undefined}>Create an account</Link></div><form onSubmit={submit} className="standalone-auth-form">{signup && <label htmlFor="auth-name">Your name<input id="auth-name" name="name" autoComplete="name" placeholder="Alex Morgan" minLength={2} maxLength={60} required /></label>}<label htmlFor="auth-email">Email address<input id="auth-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} required /></label><label htmlFor="auth-password">Password<div className="password-field"><input id="auth-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} placeholder={signup ? 'Create a strong password' : 'Enter your password'} minLength={8} maxLength={72} required aria-describedby={signup ? 'password-hint' : undefined} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></label>{signup && <><p className="auth-password-hint" id="password-hint">At least 8 characters. A mix of words and numbers works well.</p><label htmlFor="auth-confirm">Confirm password<input id="auth-confirm" name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="One more time, just to be sure" minLength={8} maxLength={72} required /></label></>}{error && <div className="auth-error" role="alert">{error}</div>}<button type="submit" className="public-button public-button-dark auth-submit" disabled={busy || checking}>{busy ? 'Just a moment…' : signup ? 'Create my account' : 'Log in to my workspace'}{!busy && <ArrowRight size={18} />}</button></form><div className="auth-security"><ShieldCheck size={17} /><span>Your own workspace. Your data stays yours.</span></div><div className="auth-demo-divider"><span />OR GET A FEEL FOR THINGS<span /></div><Link className="public-button public-button-outline auth-demo-button" href="/dashboard">Explore the demo <ArrowUpRightIcon /></Link><p className="auth-demo-caption">No account needed. Just a little curiosity.</p></div><p className="auth-form-footer">A little intention today goes a long way tomorrow.</p></section></main>;
}
function ArrowUpRightIcon() { return <ArrowRight size={17} style={{ transform: 'rotate(-40deg)' }} />; }
