'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/shared/Navbar';
import LevelUpModal from '@/components/ui/LevelUpModal';
import Toast from '@/components/ui/Toast';
import { getUserQuests, createQuest, completeQuest, deleteQuest, updateQuest } from '@/lib/db';
import { Quest, QuestCategory, Difficulty } from '@/types';
import { CATEGORY_LABELS, DIFFICULTY_LABELS, XP_REWARDS, GOLD_REWARDS } from '@/lib/rpg-engine';

const CATEGORIES: QuestCategory[] = ['fitness', 'study', 'coding', 'social', 'health', 'creative', 'work', 'other'];
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'epic'];

interface ToastData { message: string; subMessage?: string; type: 'success' | 'error' | 'xp'; }
interface LevelUpData { newLevel: number; xpGained: number; }

export default function QuestsPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();

  const [quests, setQuests] = useState<Quest[]>([]);
  const [questsLoading, setQuestsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<QuestCategory | 'all'>('all');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [levelUp, setLevelUp] = useState<LevelUpData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuestCategory>('other');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const loadQuests = useCallback(async () => {
    if (!user) return;
    const q = await getUserQuests(user.uid);
    setQuests(q);
    setQuestsLoading(false);
  }, [user]);

  useEffect(() => { loadQuests(); }, [loadQuests]);

  function resetForm() {
    setTitle(''); setDescription(''); setCategory('other');
    setDifficulty('medium'); setDueDate(''); setEditingQuest(null);
  }

  function openEditForm(q: Quest) {
    setEditingQuest(q);
    setTitle(q.title); setDescription(q.description);
    setCategory(q.category); setDifficulty(q.difficulty);
    setDueDate(q.dueDate || '');
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setToast({ message: 'Quest title is required', type: 'error' }); return; }
    if (!user) return;
    setSubmitting(true);
    try {
      if (editingQuest) {
        await updateQuest(user.uid, editingQuest.id, { title: title.trim(), description, category, difficulty, dueDate: dueDate || null });
        setToast({ message: 'Quest Updated!', subMessage: title.trim(), type: 'success' });
      } else {
        await createQuest(user.uid, { title: title.trim(), description, category, difficulty, dueDate: dueDate || null });
        setToast({ message: 'Quest Added!', subMessage: `+${XP_REWARDS[difficulty]}XP on completion`, type: 'success' });
      }
      resetForm();
      setShowForm(false);
      await loadQuests();
    } catch {
      setToast({ message: 'Failed to save quest', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleComplete(q: Quest) {
    if (!user || completingId) return;
    setCompletingId(q.id);
    // Optimistic update
    setQuests((prev) => prev.map((x) => x.id === q.id ? { ...x, status: 'completed' } : x));
    try {
      const result = await completeQuest(user.uid, q.id);
      await refreshProfile();
      setToast({
        message: `Quest Complete! +${result.xpGained}XP +${result.goldGained}💰`,
        subMessage: q.title,
        type: 'xp',
      });
      if (result.leveledUp) {
        setLevelUp({ newLevel: result.newLevel, xpGained: result.xpGained });
      }
    } catch {
      // Revert optimistic
      setQuests((prev) => prev.map((x) => x.id === q.id ? { ...x, status: 'pending' } : x));
      setToast({ message: 'Failed to complete quest', type: 'error' });
    } finally {
      setCompletingId(null);
    }
  }

  async function handleDelete(questId: string) {
    if (!user || deletingId) return;
    if (!confirm('Abandon this quest? This cannot be undone.')) return;
    setDeletingId(questId);
    setQuests((prev) => prev.filter((q) => q.id !== questId));
    try {
      await deleteQuest(user.uid, questId);
      setToast({ message: 'Quest abandoned', type: 'success' });
    } catch {
      await loadQuests();
      setToast({ message: 'Failed to delete quest', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = quests
    .filter((q) => filter === 'all' || q.status === filter)
    .filter((q) => categoryFilter === 'all' || q.category === categoryFilter);

  if (loading) return <><Navbar /><main style={{ padding: '2rem' }}><div className="skeleton" style={{ height: '200px' }} /></main></>;

  return (
    <>
      <Navbar />
      {levelUp && (
        <LevelUpModal
          newLevel={levelUp.newLevel}
          xpGained={levelUp.xpGained}
          onClose={() => setLevelUp(null)}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          subMessage={toast.subMessage}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <main className="container-app" style={{ padding: '2rem 1rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.75rem', marginBottom: '0.25rem' }} className="text-gold-gradient">
              Quest Board
            </h1>
            <p style={{ color: 'var(--ink-muted)' }}>
              {quests.filter(q => q.status === 'pending').length} active · {quests.filter(q => q.status === 'completed').length} completed
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { resetForm(); setShowForm(true); }}
            id="add-quest-btn"
          >
            ⚔️ New Quest
          </button>
        </div>

        {/* Add/Edit Quest Form */}
        {showForm && (
          <div className="card animate-slide-up" style={{ marginBottom: '2rem', border: '1px solid rgba(201,168,76,0.4)' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: 'var(--gold)', marginBottom: '1.25rem', fontSize: '1rem' }}>
              {editingQuest ? '✏️ Edit Quest' : '⚔️ New Quest'}
            </h2>
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="q-title" style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '0.375rem', letterSpacing: '0.1em' }}>QUEST TITLE *</label>
                  <input id="q-title" className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Defeat the dragon of procrastination" required autoFocus />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="q-desc" style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '0.375rem', letterSpacing: '0.1em' }}>DESCRIPTION</label>
                  <textarea id="q-desc" className="input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your quest..." rows={2} style={{ resize: 'vertical', fontFamily: 'Rajdhani, sans-serif' }} />
                </div>

                <div>
                  <label htmlFor="q-cat" style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '0.375rem', letterSpacing: '0.1em' }}>CATEGORY</label>
                  <select id="q-cat" className="input select" value={category} onChange={e => setCategory(e.target.value as QuestCategory)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="q-diff" style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '0.375rem', letterSpacing: '0.1em' }}>DIFFICULTY</label>
                  <select id="q-diff" className="input select" value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)}>
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{DIFFICULTY_LABELS[d]} (+{XP_REWARDS[d]}XP)</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="q-due" style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '0.375rem', letterSpacing: '0.1em' }}>DUE DATE</label>
                  <input id="q-due" className="input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
              </div>

              {/* Reward Preview */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--parchment-3)', borderRadius: '8px', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--gold)', fontSize: '0.85rem' }}>⭐ +{XP_REWARDS[difficulty]} XP</span>
                <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>💰 +{GOLD_REWARDS[difficulty]} Gold</span>
                <span style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>{CATEGORY_LABELS[category]}</span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '⏳ Saving...' : (editingQuest ? '✅ Update Quest' : '⚔️ Add Quest')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {(['all', 'pending', 'completed'] as const).map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All Quests' : f === 'pending' ? '⏳ Active' : '✅ Completed'}
            </button>
          ))}
          <div style={{ flex: 1, minWidth: '140px' }}>
            <select className="input select" style={{ height: '100%', padding: '0.375rem 2rem 0.375rem 0.75rem', fontSize: '0.85rem' }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as QuestCategory | 'all')}>
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </div>
        </div>

        {/* Quest Grid */}
        {questsLoading ? (
          <div className="quests-grid">
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '160px' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📜</div>
            <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--gold)', marginBottom: '0.5rem' }}>No Quests Found</h3>
            <p style={{ color: 'var(--ink-muted)', marginBottom: '1.5rem' }}>
              {filter !== 'all' ? 'Try changing your filter.' : 'Create your first quest to begin your adventure!'}
            </p>
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>⚔️ Create Quest</button>
          </div>
        ) : (
          <div className="quests-grid">
            {filtered.map((q) => (
              <article
                key={q.id}
                className="card"
                style={{
                  opacity: q.status === 'completed' ? 0.7 : 1,
                  borderColor: q.status === 'completed' ? 'rgba(74,222,128,0.2)' : undefined,
                }}
              >
                {/* Category + Difficulty */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span className={`badge badge-${q.difficulty}`}>{DIFFICULTY_LABELS[q.difficulty]}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{CATEGORY_LABELS[q.category]}</span>
                </div>

                {/* Title */}
                <h3 style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '1rem',
                  color: 'var(--ink)',
                  marginBottom: '0.5rem',
                  textDecoration: q.status === 'completed' ? 'line-through' : 'none',
                }}>
                  {q.title}
                </h3>

                {q.description && (
                  <p style={{ color: 'var(--ink-muted)', fontSize: '0.875rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                    {q.description}
                  </p>
                )}

                {/* Rewards */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>⭐ {q.xpReward} XP</span>
                  <span style={{ fontSize: '0.8rem', color: '#f59e0b' }}>💰 {q.goldReward} Gold</span>
                  {q.dueDate && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--ink-faint)', marginLeft: 'auto' }}>
                      📅 {new Date(q.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {q.status === 'pending' && (
                    <>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleComplete(q)}
                        disabled={completingId === q.id}
                        style={{ flex: 1, justifyContent: 'center' }}
                        aria-label={`Complete quest: ${q.title}`}
                      >
                        {completingId === q.id ? '⏳' : '✅'} Complete
                      </button>
                      <button
                        className="btn btn-secondary btn-icon"
                        onClick={() => openEditForm(q)}
                        aria-label={`Edit quest: ${q.title}`}
                      >
                        ✏️
                      </button>
                    </>
                  )}
                  <button
                    className="btn btn-danger btn-icon"
                    onClick={() => handleDelete(q.id)}
                    disabled={deletingId === q.id}
                    aria-label={`Delete quest: ${q.title}`}
                  >
                    🗑️
                  </button>
                </div>

                {q.status === 'completed' && q.completedAt && (
                  <p style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '0.5rem' }}>
                    ✅ Completed {new Date(q.completedAt).toLocaleDateString()}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
