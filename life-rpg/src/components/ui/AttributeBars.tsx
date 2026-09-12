'use client';

import { ATTRIBUTE_ICONS, ATTRIBUTE_COLORS } from '@/lib/rpg-engine';
import { Attributes } from '@/types';

interface AttributeBarsProps {
  attributes: Attributes;
  maxValue?: number;
}

const ATTR_KEYS = ['strength', 'intellect', 'vitality', 'charisma', 'endurance'] as const;
const ATTR_NAMES: Record<keyof Attributes, string> = {
  strength: 'Strength',
  intellect: 'Intellect',
  vitality: 'Vitality',
  charisma: 'Charisma',
  endurance: 'Endurance',
};

export default function AttributeBars({ attributes, maxValue = 100 }: AttributeBarsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {ATTR_KEYS.map((key) => {
        const value = attributes[key];
        const pct = Math.min((value / maxValue) * 100, 100);
        const color = ATTRIBUTE_COLORS[key];
        return (
          <div key={key}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.3rem',
              }}
            >
              <span
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.8rem',
                  color: color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
              >
                <span>{ATTRIBUTE_ICONS[key]}</span>
                {ATTR_NAMES[key]}
              </span>
              <span style={{ color: 'var(--ink-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                {value}
              </span>
            </div>
            <div className="attr-bar-track">
              <div
                className="attr-bar-fill"
                style={{ width: `${pct}%`, background: color }}
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={maxValue}
                aria-label={`${ATTR_NAMES[key]}: ${value}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
