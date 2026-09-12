'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/shared/Navbar';

export default function LoginPage() {
  const { login, loginWithGoogle, loginAsDemo, isDemoMode } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim() || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo() {
    setLoading(true);
    try {
      await loginAsDemo();
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Demo login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }} className="animate-float">🏰</div>
            <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.5rem', marginBottom: '0.25rem' }} className="text-gold-gradient">
              Welcome Back
            </h1>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>Your quest log awaits, adventurer</p>
          </div>

          {isDemoMode && (
            <div style={{ background: 'rgba(217, 119, 6, 0.15)', border: '1px solid var(--gold)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#fef3c7' }}>
              ℹ️ <strong>Demo Mode Active:</strong> Firebase keys are using default local settings. You can log in instantly below!
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '0.375rem', letterSpacing: '0.1em' }}>
                SCROLL (EMAIL)
              </label>
              <input
                id="email"
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hero@realm.com"
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '0.375rem', letterSpacing: '0.1em' }}>
                PASSPHRASE
              </label>
              <input
                id="password"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your secret passphrase"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div role="alert" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#ef4444', fontSize: '0.875rem' }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            >
              {loading ? '⏳ Opening gate...' : '🗡️ Begin Adventure'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0' }}>
            <hr className="divider-gold" style={{ flex: 1, margin: 0 }} />
            <span style={{ color: 'var(--ink-faint)', fontSize: '0.8rem', fontFamily: 'Cinzel, serif' }}>OR</span>
            <hr className="divider-gold" style={{ flex: 1, margin: 0 }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={handleGoogle} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <button type="button" className="btn btn-ghost" onClick={handleDemo} disabled={loading} style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--gold)', color: 'var(--gold-light)' }}>
              ⚡ Instant Play (Demo Adventurer)
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--ink-muted)', fontSize: '0.875rem' }}>
            New adventurer?{' '}
            <Link href="/register" style={{ color: 'var(--gold)', textDecoration: 'none', fontFamily: 'Cinzel, serif' }}>
              Create your character
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
