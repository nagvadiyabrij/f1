'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/shared/Navbar';

const AVATARS = ['🧙', '⚔️', '🛡️', '🗡️', '🏹', '🧝', '🧟', '🦸', '🧌', '🐉', '🦄', '🔮'];

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('🧙');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) { setError('Enter your adventurer name'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    try {
      await register(email, password, displayName.trim(), avatar);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim());
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

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{avatar}</div>
            <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.5rem', marginBottom: '0.25rem' }} className="text-gold-gradient">
              Create Character
            </h1>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>Begin your legendary journey</p>
          </div>

          {/* Avatar Picker */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: 'var(--gold)', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
              CHOOSE YOUR CLASS
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  aria-label={`Select avatar ${a}`}
                  aria-pressed={avatar === a}
                  style={{
                    fontSize: '1.5rem',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: avatar === a ? '2px solid var(--gold)' : '2px solid transparent',
                    background: avatar === a ? 'rgba(201,168,76,0.15)' : 'var(--parchment-3)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    boxShadow: avatar === a ? 'var(--shadow-gold)' : 'none',
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="displayName" style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '0.375rem', letterSpacing: '0.1em' }}>
                ADVENTURER NAME
              </label>
              <input
                id="displayName"
                className="input"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Sir Reginald the Bold"
                required
                autoComplete="name"
              />
            </div>

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
              />
            </div>

            <div>
              <label htmlFor="password" style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '0.375rem', letterSpacing: '0.1em' }}>
                SECRET PASSPHRASE
              </label>
              <input
                id="password"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                autoComplete="new-password"
                minLength={6}
              />
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  color: '#ef4444',
                  fontSize: '0.875rem',
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            >
              {loading ? '⏳ Creating character...' : '⚔️ Begin Adventure'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
            <hr className="divider-gold" style={{ flex: 1, margin: 0 }} />
            <span style={{ color: 'var(--ink-faint)', fontSize: '0.8rem', fontFamily: 'Cinzel, serif' }}>OR</span>
            <hr className="divider-gold" style={{ flex: 1, margin: 0 }} />
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleGoogle}
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--ink-muted)', fontSize: '0.875rem' }}>
            Already an adventurer?{' '}
            <Link href="/login" style={{ color: 'var(--gold)', textDecoration: 'none', fontFamily: 'Cinzel, serif' }}>
              Login here
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
