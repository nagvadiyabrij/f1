'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import XPBar from '@/components/ui/XPBar';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Realm', icon: '🏰' },
  { href: '/quests',    label: 'Quests', icon: '⚔️' },
  { href: '/character', label: 'Character', icon: '🧙' },
  { href: '/shop',      label: 'Shop', icon: '🏪' },
  { href: '/leaderboard', label: 'Rankings', icon: '👑' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  return (
    <header
      style={{
        background: 'rgba(26,18,8,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(201,168,76,0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div className="container-app">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.75rem 0',
          }}
        >
          {/* Logo */}
          <Link
            href={user ? '/dashboard' : '/'}
            style={{
              fontFamily: 'Cinzel, serif',
              fontWeight: 900,
              fontSize: '1.25rem',
              textDecoration: 'none',
              flexShrink: 0,
            }}
            className="text-gold-gradient"
          >
            ⚔️ Life RPG
          </Link>

          {/* Nav Links */}
          {user && (
            <nav
              style={{ display: 'flex', gap: '0.25rem', marginLeft: '1rem' }}
              aria-label="Main navigation"
            >
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontFamily: 'Cinzel, serif',
                      fontWeight: active ? 700 : 400,
                      color: active ? 'var(--gold)' : 'var(--ink-muted)',
                      background: active ? 'rgba(201,168,76,0.1)' : 'transparent',
                      border: active ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      transition: 'var(--transition)',
                    }}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* User Info */}
          {user && profile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* XP Bar compact */}
              <div style={{ width: '140px', display: 'none' }} className="xp-nav-bar">
                <XPBar totalXP={profile.totalXP} level={profile.level} showNumbers={false} height="sm" />
              </div>

              {/* Gold */}
              <span
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.85rem',
                  color: 'var(--gold)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                💰 {profile.gold.toLocaleString()}
              </span>

              {/* Streak */}
              {profile.streak > 0 && (
                <span
                  style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '0.85rem',
                    color: '#f97316',
                  }}
                >
                  🔥 {profile.streak}
                </span>
              )}

              {/* Avatar + Level */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{profile.avatar}</span>
                <div>
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: 'var(--ink)', lineHeight: 1 }}>
                    {profile.displayName}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--gold)', lineHeight: 1 }}>
                    Lv. {profile.level}
                  </p>
                </div>
              </div>

              <button
                className="btn btn-ghost btn-sm"
                onClick={handleLogout}
                aria-label="Log out"
              >
                Logout
              </button>
            </div>
          ) : (
            !user && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link href="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link href="/register" className="btn btn-primary btn-sm">Join</Link>
              </div>
            )
          )}
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          .xp-nav-bar { display: block !important; }
        }
        @media (max-width: 640px) {
          .nav-label { display: none; }
        }
      `}</style>
    </header>
  );
}
