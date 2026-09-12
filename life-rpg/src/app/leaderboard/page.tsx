'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/shared/Navbar';
import { getLeaderboard } from '@/lib/db';
import { LeaderboardEntry } from '@/types';

export default function LeaderboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    getLeaderboard()
      .then(setEntries)
      .finally(() => setLbLoading(false));
  }, []);

  const MEDALS = ['🥇', '🥈', '🥉'];

  return (
    <>
      <Navbar />
      <main className="container-app" style={{ padding: '2rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '2rem', marginBottom: '0.5rem' }} className="text-gold-gradient">
            Hall of Legends
          </h1>
          <p style={{ color: 'var(--ink-muted)' }}>The mightiest adventurers across the realm</p>
        </div>

        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {lbLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: '64px' }} />)}
            </div>
          ) : entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>👑</div>
              <p style={{ fontFamily: 'Cinzel, serif' }}>No adventurers yet. Be the first!</p>
            </div>
          ) : (
            <table className="table-fantasy" role="table" aria-label="Leaderboard">
              <thead>
                <tr>
                  <th scope="col">Rank</th>
                  <th scope="col">Adventurer</th>
                  <th scope="col">Level</th>
                  <th scope="col">Total XP</th>
                  <th scope="col">Quests</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => {
                  const isMe = user?.uid === entry.uid;
                  return (
                    <tr
                      key={entry.uid}
                      style={{
                        background: isMe ? 'rgba(201,168,76,0.08)' : undefined,
                      }}
                    >
                      <td>
                        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem' }}>
                          {i < 3 ? MEDALS[i] : `#${i + 1}`}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '1.5rem' }}>{entry.avatar}</span>
                          <div>
                            <p style={{
                              fontFamily: 'Cinzel, serif',
                              fontSize: '0.9rem',
                              color: isMe ? 'var(--gold)' : 'var(--ink)',
                            }}>
                              {entry.displayName} {isMe && '(You)'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="level-badge" style={{ width: '2rem', height: '2rem', fontSize: '0.75rem' }}>
                          {entry.level}
                        </div>
                      </td>
                      <td>
                        <span style={{ color: 'var(--gold)', fontFamily: 'Cinzel, serif', fontWeight: 600 }}>
                          {entry.totalXP.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--ink-muted)' }}>{entry.questsCompleted}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {profile && (
          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--ink-muted)', fontSize: '0.875rem' }}>
            Your ranking is highlighted in gold. Complete more quests to climb higher! 🏆
          </p>
        )}
      </main>
    </>
  );
}
