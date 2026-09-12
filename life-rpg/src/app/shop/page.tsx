'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/shared/Navbar';
import Toast from '@/components/ui/Toast';
import { purchaseItem } from '@/lib/db';
import { SHOP_ITEMS } from '@/lib/shop-items';
import { ShopItem } from '@/types';

type ToastData = { message: string; subMessage?: string; type: 'success' | 'error' };
type FilterType = 'all' | 'theme' | 'avatar' | 'badge' | 'boost';

const RARITY_ORDER = { common: 0, rare: 1, epic: 2, legendary: 3 };
const RARITY_BADGE_CLASS: Record<string, string> = {
  common: 'badge-common', rare: 'badge-rare', epic: 'badge-epic-r', legendary: 'badge-legendary',
};

export default function ShopPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [toast, setToast] = useState<ToastData | null>(null);
  const [buying, setBuying] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  async function handleBuy(item: ShopItem) {
    if (!user || !profile) return;
    if (profile.inventory.includes(item.id)) {
      setToast({ message: 'Already owned!', type: 'error' });
      setConfirmItem(null);
      return;
    }
    if (profile.gold < item.cost) {
      setToast({ message: 'Not enough Gold!', subMessage: `You need ${item.cost - profile.gold} more gold`, type: 'error' });
      setConfirmItem(null);
      return;
    }
    setBuying(item.id);
    try {
      await purchaseItem(user.uid, item);
      await refreshProfile();
      setToast({ message: `${item.name} purchased!`, subMessage: `-${item.cost} Gold`, type: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Purchase failed';
      setToast({ message: msg, type: 'error' });
    } finally {
      setBuying(null);
      setConfirmItem(null);
    }
  }

  if (loading || !profile) {
    return (
      <>
        <Navbar />
        <main className="container-app" style={{ padding: '2rem 1rem' }}>
          <div className="shop-grid">{[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: '240px' }} />)}</div>
        </main>
      </>
    );
  }

  const sorted = [...SHOP_ITEMS].sort((a, b) => RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity]);
  const filtered = sorted.filter(item => filter === 'all' || item.type === filter);

  return (
    <>
      <Navbar />
      {toast && <Toast message={toast.message} subMessage={toast.subMessage} type={toast.type} onClose={() => setToast(null)} />}

      {/* Confirm Modal */}
      {confirmItem && (
        <div className="overlay-backdrop" onClick={() => setConfirmItem(null)}>
          <div className="card animate-scale-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '380px', width: '90%', textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{confirmItem.icon}</div>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: 'var(--gold)', marginBottom: '0.5rem' }}>{confirmItem.name}</h2>
            <p style={{ color: 'var(--ink-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{confirmItem.description}</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-ghost" onClick={() => setConfirmItem(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => handleBuy(confirmItem)}
                disabled={buying === confirmItem.id}
              >
                {buying === confirmItem.id ? '⏳ Buying...' : `💰 Buy for ${confirmItem.cost} Gold`}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="container-app" style={{ padding: '2rem 1rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.75rem', marginBottom: '0.25rem' }} className="text-gold-gradient">
              The Merchant's Shop
            </h1>
            <p style={{ color: 'var(--ink-muted)' }}>Spend your hard-earned gold on themes, badges, and more</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--parchment-2)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(201,168,76,0.2)' }}>
            <span style={{ fontSize: '1.25rem' }}>💰</span>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1.25rem', color: 'var(--gold)', fontWeight: 700 }}>
              {profile.gold.toLocaleString()}
            </span>
            <span style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>Gold</span>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {(['all', 'theme', 'avatar', 'badge', 'boost'] as FilterType[]).map(f => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All Items' : f === 'theme' ? '🎨 Themes' : f === 'avatar' ? '🧙 Avatars' : f === 'badge' ? '🎖️ Badges' : '⚗️ Boosts'}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="shop-grid">
          {filtered.map((item) => {
            const owned = profile.inventory.includes(item.id);
            const canAfford = profile.gold >= item.cost;
            return (
              <article
                key={item.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: owned ? 0.7 : 1,
                }}
              >
                {/* Icon + Rarity */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '2.5rem' }}>{item.icon}</div>
                  <span className={`badge ${RARITY_BADGE_CLASS[item.rarity]}`}>
                    {item.rarity.toUpperCase()}
                  </span>
                </div>

                <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.95rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>
                  {item.name}
                </h3>
                <p style={{ color: 'var(--ink-muted)', fontSize: '0.85rem', lineHeight: 1.5, flex: 1, marginBottom: '1rem' }}>
                  {item.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', color: canAfford || owned ? 'var(--gold)' : '#ef4444', fontWeight: 700 }}>
                    💰 {item.cost}
                  </span>
                  {owned ? (
                    <span style={{ color: '#4ade80', fontSize: '0.85rem', fontFamily: 'Cinzel, serif' }}>✅ Owned</span>
                  ) : (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => setConfirmItem(item)}
                      disabled={!canAfford || buying === item.id}
                      aria-label={`Buy ${item.name} for ${item.cost} gold`}
                    >
                      {buying === item.id ? '⏳' : canAfford ? 'Buy' : 'Need Gold'}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </>
  );
}
