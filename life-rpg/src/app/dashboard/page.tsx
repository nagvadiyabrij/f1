'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/shared/Navbar';
import XPBar from '@/components/ui/XPBar';
import AttributeBars from '@/components/ui/AttributeBars';
import { getUserQuests } from '@/lib/db';
import { Quest } from '@/types';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/lib/rpg-engine';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [recentQuests, setRecentQuests] = useState<Quest[]>([]);
  const [questsLoading, setQuestsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    getUserQuests(user.uid)
      .then((q) => setRecentQuests(q.slice(0, 6)))
      .finally(() => setQuestsLoading(false));
  }, [user]);

  if (loading || !profile) {
    return (
      <>
        <Navbar />
        <main className="container-app" style={{ padding: '2rem 1rem' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '120px' }} />)}
          </div>
        </main>
      </>
    );
  }

  const pendingCount = recentQuests.filter(q => q.status === 'pending').length;
  const completedCount = recentQuests.filter(q => q.status === 'completed').length;

  return (
    <>
      <Navbar />
      <main className="container-app" style={{ padding: '2rem 1rem' }}>
        {/* Welcome Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', marginBottom: '0.25rem' }} className="text-gold-gradient">
              Welcome, {profile.displayName}
            </h1>
            <p style={{ color: 'var(--ink-muted)' }}>
              {profile.streak > 0 ? `🔥 ${profile.streak}-day streak! Keep the fire burning.` : 'Complete a quest to start your streak!'}
            </p>
          </div>
          <Link href="/quests" className="btn btn-primary">
            ⚔️ New Quest
          </Link>
        </div>

        {/* Stats Row */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          {/* Character Card */}
          <div className="card" style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '2.5rem' }}>{profile.avatar}</div>
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: 'var(--gold)', letterSpacing: '0.1em' }}>ADVENTURER</div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem', color: 'var(--ink)' }}>{profile.displayName}</div>
              </div>
              <div className="level-badge" style={{ marginLeft: 'auto' }}>{profile.level}</div>
            </div>
            <XPBar totalXP={profile.totalXP} level={profile.level} />
          </div>

          {/* Gold */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '2rem', color: 'var(--gold)', fontWeight: 700 }}>
              {profile.gold.toLocaleString()}
            </div>
            <div style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>Gold</div>
          </div>

          {/* Streak */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '2rem', color: '#f97316', fontWeight: 700 }}>
              {profile.streak}
            </div>
            <div style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>Day Streak</div>
          </div>

          {/* Quests Completed */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚔️</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '2rem', color: 'var(--gold)', fontWeight: 700 }}>
              {profile.questsCompleted}
            </div>
            <div style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>Quests Done</div>
          </div>
        </div>

        {/* Bottom Grid: Attributes + Recent Quests */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Attributes */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', color: 'var(--gold)' }}>Character Stats</h2>
              <Link href="/character" style={{ color: 'var(--ink-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>
                View sheet →
              </Link>
            </div>
            <AttributeBars attributes={profile.attributes} maxValue={50} />
          </div>

          {/* Recent Quests */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', color: 'var(--gold)' }}>Quest Board</h2>
              <Link href="/quests" style={{ color: 'var(--ink-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>
                View all →
              </Link>
            </div>

            {questsLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '56px' }} />)}
              </div>
            ) : recentQuests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ink-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📜</div>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.9rem' }}>No quests yet</p>
                <Link href="/quests" className="btn btn-primary btn-sm" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                  Create First Quest
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {recentQuests.map((q) => (
                  <div
                    key={q.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      background: 'var(--parchment-3)',
                      borderRadius: '8px',
                      border: '1px solid rgba(201,168,76,0.1)',
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{q.status === 'completed' ? '✅' : '📜'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: q.status === 'completed' ? 'var(--ink-muted)' : 'var(--ink)',
                        textDecoration: q.status === 'completed' ? 'line-through' : 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {q.title}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--ink-faint)' }}>
                        {CATEGORY_LABELS[q.category]} · {DIFFICULTY_LABELS[q.difficulty]}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontFamily: 'Cinzel, serif', flexShrink: 0 }}>
                      +{q.xpReward}XP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
