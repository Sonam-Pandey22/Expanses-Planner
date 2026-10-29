'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import ThemeToggle from './theme-toggle';

export function Brand({ className = '' }: { className?: string }) {
  return <Link href="/" className={`brand ${className}`} aria-label="Expanse home"><span className="brand-symbol" aria-hidden="true"><span /><span /><span /></span>expanse<span className="brand-period">.</span></Link>;
}
export default function PublicNav() {
  const [open, setOpen] = useState(false);
  return <header className="public-header"><div className="public-container public-header-inner"><Brand /><nav className="desktop-public-nav" aria-label="Site navigation"><a href="#features">Why Expanse</a><a href="#how-it-works">How it works</a><a href="#questions">FAQs</a></nav><div className="public-header-actions"><ThemeToggle /><Link className="public-login" href="/login">Log in</Link><Link className="public-button public-button-dark nav-signup" href="/signup">Get started <ArrowUpRight size={17} /></Link><button className="public-menu-button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="public-mobile-nav" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div></div>{open && <nav className="public-mobile-nav" id="public-mobile-nav" aria-label="Mobile site navigation"><a href="#features" onClick={() => setOpen(false)}>Why Expanse</a><a href="#how-it-works" onClick={() => setOpen(false)}>How it works</a><a href="#questions" onClick={() => setOpen(false)}>FAQs</a><Link href="/signup">Create an account <ArrowUpRight size={17} /></Link></nav>}</header>;
}
