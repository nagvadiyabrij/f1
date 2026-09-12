'use client';

import { levelProgress, xpToNextLevel, currentLevelXP } from '@/lib/rpg-engine';

interface XPBarProps {
  totalXP: number;
  level: number;
  className?: string;
  showNumbers?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

export default function XPBar({
  totalXP,
  level,
  className = '',
  showNumbers = true,
  height = 'md',
}: XPBarProps) {
  const progress = levelProgress(totalXP);
  const curr = currentLevelXP(totalXP);
  const needed = xpToNextLevel(totalXP);

  const heights = { sm: '6px', md: '12px', lg: '16px' };

  return (
    <div className={className}>
      {showNumbers && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--gold)', fontFamily: 'Cinzel, serif' }}>
            Level {level}
          </span>
          <span style={{ color: 'var(--ink-muted)' }}>
            {curr.toLocaleString()} / {needed.toLocaleString()} XP
          </span>
        </div>
      )}
      <div className="xp-bar-track" style={{ height: heights[height] }}>
        <div
          className="xp-bar-fill"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`XP progress: ${Math.round(progress)}%`}
        />
      </div>
    </div>
  );
}
