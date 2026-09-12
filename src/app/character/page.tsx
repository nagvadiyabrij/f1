'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/shared/Navbar';
import XPBar from '@/components/ui/XPBar';
import AttributeBars from '@/components/ui/AttributeBars';
import { ATTRIBUTE_ICONS, ATTRIBUTE_COLORS } from '@/lib/rpg-engine';
import { Attributes } from '@/types';

const ACHIEVEMENT_BADGES = [
  { id: 'first-quest', icon: '🎖️', name: 'First Quest', desc: 'Complete your first quest', require: (q: number) => q >= 1 },
  { id: 'ten-quests',  icon: '⚔️', name: 'Warrior\'s Path', desc: '10 quests completed', require: (q: number) => q >= 10 },
  { id: 'fifty',      icon: '🔱', name: 'Half Century', desc: '50 quests completed', require: (q: number) => q >= 50 },
  { id: 'hundred',    icon: '💯', name: 'Century Slayer', desc: '100 quests completed', require: (q: number) => q >= 100 },
  { id: 'level-5',    icon: '⭐', name: 'Rising Star', desc: 'Reach Level 5', require: (_: number, l: number) => l >= 5 },
  { id: 'level-10',   icon: '🌟', name: 'Veteran', desc: 'Reach Level 10', require: (_: number, l: number) => l >= 10 },
  { id: 'level-25',   icon: '💎', name: 'Elite', desc: 'Reach Level 25', require: (_: number, l: number) => l >= 25 },
  { id: 'level-50',   icon: '👑', name: 'Legendary', desc: 'Reach Level 50', require: (_: number, l: number) => l >= 50 },
];

export default function CharacterPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !profile) {
    return (
      <>
        <Navbar />
        <main className="container-app" style={{ padding: '2rem 1rem' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: '180px' }} />)}
          </div>
        </main>
      </>
    );
  }

  const attrTotal = Object.values(profile.attributes).reduce((a, b) => a + b, 0);

  return (
    <>
      <Navbar />
      <main className="container-app" style={{ padding: '2rem 1rem' }}>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.75rem', marginBottom: '2rem' }} className="text-gold-gradient">
          Character Sheet
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Identity Card */}
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{profile.avatar}</div>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.25rem', marginBottom: '0.25rem' }} className="text-gold-gradient">
              {profile.displayName}
            </h2>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {profile.email}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.75rem', color: 'var(--gold)', fontWeight: 700 }}>
                  {profile.level}
                </div>
                <div style={{ color: 'var(--ink-muted)', fontSize: '0.75rem' }}>Level</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.75rem', color: '#f97316', fontWeight: 700 }}>
                  {profile.streak}
                </div>
                <div style={{ color: 'var(--ink-muted)', fontSize: '0.75rem' }}>Streak</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.75rem', color: 'var(--gold)', fontWeight: 700 }}>
                  {profile.gold}
                </div>
                <div style={{ color: 'var(--ink-muted)', fontSize: '0.75rem' }}>Gold</div>
              </div>
            </div>

            <XPBar totalXP={profile.totalXP} level={profile.level} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem' }}>
              <div style={{ background: 'var(--parchment-3)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.25rem', color: 'var(--gold)' }}>{profile.questsCompleted}</div>
                <div style={{ color: 'var(--ink-muted)', fontSize: '0.75rem' }}>Quests Done</div>
              </div>
              <div style={{ background: 'var(--parchment-3)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.25rem', color: '#f97316' }}>{profile.longestStreak}</div>
                <div style={{ color: 'var(--ink-muted)', fontSize: '0.75rem' }}>Best Streak</div>
              </div>
            </div>
          </div>

          {/* Attributes */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', color: 'var(--gold)' }}>Attributes</h2>
              <span style={{ color: 'var(--ink-muted)', fontSize: '0.8rem' }}>Total: {attrTotal} pts</span>
            </div>
            <AttributeBars attributes={profile.attributes} maxValue={Math.max(50, attrTotal)} />

            <hr className="divider-gold" style={{ marginTop: '1.5rem' }} />
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.8rem', lineHeight: 1.6 }}>
              Attributes grow by completing category-specific quests.
              Complete <strong style={{ color: 'var(--gold)' }}>Fitness</strong> quests for Strength,
              <strong style={{ color: 'var(--gold)' }}> Study</strong> for Intellect, and so on.
            </p>
          </div>

          {/* Attribute Breakdown (radar-like display) */}
          <div className="card">
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', color: 'var(--gold)', marginBottom: '1.25rem' }}>
              Stat Breakdown
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(Object.keys(profile.attributes) as (keyof Attributes)[]).map((key) => {
                const val = profile.attributes[key];
                const color = ATTRIBUTE_COLORS[key];
                const pct = attrTotal > 0 ? ((val / attrTotal) * 100).toFixed(1) : '0.0';
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem', width: '1.5rem', textAlign: 'center' }}>{ATTRIBUTE_ICONS[key]}</span>
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color, minWidth: '80px', textTransform: 'capitalize' }}>{key}</span>
                    <div style={{ flex: 1, background: 'var(--parchment-3)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
                    </div>
                    <span style={{ color: 'var(--ink-muted)', fontSize: '0.8rem', minWidth: '40px', textAlign: 'right' }}>{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', color: 'var(--gold)', marginBottom: '1.25rem' }}>
            🏆 Achievements
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
            {ACHIEVEMENT_BADGES.map((badge) => {
              const unlocked = badge.require(profile.questsCompleted, profile.level);
              return (
                <div
                  key={badge.id}
                  style={{
                    background: 'var(--parchment-3)',
                    borderRadius: '12px',
                    padding: '1rem',
                    textAlign: 'center',
                    border: unlocked ? '1px solid rgba(201,168,76,0.4)' : '1px solid rgba(255,255,255,0.05)',
                    opacity: unlocked ? 1 : 0.4,
                    filter: unlocked ? 'none' : 'grayscale(1)',
                    transition: 'var(--transition)',
                  }}
                  title={badge.desc}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{badge.icon}</div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: unlocked ? 'var(--gold)' : 'var(--ink-muted)', lineHeight: 1.3 }}>
                    {badge.name}
                  </div>
                  {unlocked && <div style={{ fontSize: '0.65rem', color: '#4ade80', marginTop: '0.25rem' }}>UNLOCKED</div>}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
