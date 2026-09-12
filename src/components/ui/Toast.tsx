'use client';

import { useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'xp';

interface ToastProps {
  message: string;
  type?: ToastType;
  subMessage?: string;
  onClose: () => void;
  duration?: number;
}

const ICONS: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  info: '📜',
  xp: '⭐',
};

export default function Toast({
  message,
  type = 'success',
  subMessage,
  onClose,
  duration = 3500,
}: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div
      className={`toast toast-${type === 'error' ? 'error' : 'success'}`}
      role="alert"
      aria-live="polite"
    >
      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{ICONS[type]}</span>
      <div>
        <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 600, color: 'var(--ink)', fontSize: '0.9rem' }}>
          {message}
        </p>
        {subMessage && (
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            {subMessage}
          </p>
        )}
      </div>
      <button
        className="btn btn-ghost btn-icon"
        onClick={onClose}
        aria-label="Close notification"
        style={{ marginLeft: 'auto', flexShrink: 0, padding: '0.25rem' }}
      >
        ✕
      </button>
    </div>
  );
}
