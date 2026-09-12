'use client';

import { useEffect, useRef } from 'react';

interface LevelUpModalProps {
  newLevel: number;
  xpGained: number;
  onClose: () => void;
}

export default function LevelUpModal({ newLevel, xpGained, onClose }: LevelUpModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particle burst
    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      life: number; maxLife: number; color: string; size: number;
    }> = [];

    const colors = ['#c9a84c', '#e8d48a', '#fbbf24', '#f59e0b', '#ffffff'];
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    for (let i = 0; i < 120; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 2 + Math.random() * 8;
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 60 + Math.random() * 60,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 4,
      });
    }

    let animId: number;
    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.life++;
        if (p.life < p.maxLife) {
          alive = true;
          const alpha = 1 - p.life / p.maxLife;
          ctx!.globalAlpha = alpha;
          ctx!.fillStyle = p.color;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
      ctx!.globalAlpha = 1;
      if (alive) animId = requestAnimationFrame(animate);
    }
    animate();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="overlay-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Level Up!">
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />
      <div
        className="card animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          textAlign: 'center',
          padding: '3rem 2.5rem',
          maxWidth: '420px',
          width: '90%',
          border: '2px solid var(--gold)',
          boxShadow: '0 0 60px rgba(201,168,76,0.5)',
          zIndex: 1,
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '0.5rem', animation: 'float 2s ease-in-out infinite' }}>
          ⚔️
        </div>
        <h2
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '1rem',
            color: 'var(--gold)',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
          }}
        >
          Level Up!
        </h2>
        <div
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '5rem',
            fontWeight: 900,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #e8d48a, #c9a84c, #8b6914)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
          }}
        >
          {newLevel}
        </div>
        <p style={{ color: 'var(--ink-muted)', marginBottom: '0.5rem' }}>
          You earned <span style={{ color: '#facc15', fontWeight: 700 }}>+{xpGained} XP</span>
        </p>
        <p style={{ color: 'var(--ink)', fontSize: '1.1rem', marginBottom: '2rem' }}>
          You have ascended to a new level of power, brave adventurer!
        </p>
        <button className="btn btn-primary btn-lg" onClick={onClose} autoFocus>
          ⚔️ Continue Quest
        </button>
      </div>
    </div>
  );
}
