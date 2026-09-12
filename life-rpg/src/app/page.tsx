'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles: Array<{
      x: number; y: number; vx: number; vy: number; size: number; alpha: number;
    }> = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.5 - 0.2,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    let animId: number;
    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) p.y = canvas!.height;
        if (p.x < 0) p.x = canvas!.width;
        if (p.x > canvas!.width) p.x = 0;
        ctx!.globalAlpha = p.alpha;
        ctx!.fillStyle = '#c9a84c';
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const features = [
    { icon: '⚔️', title: 'Epic Quests', desc: 'Transform daily tasks into legendary quests. Complete them to earn XP and Gold.' },
    { icon: '📈', title: 'Non-linear Leveling', desc: 'A real progression system — each level requires more XP. Growth is earned, not given.' },
    { icon: '🏆', title: 'Character Attributes', desc: '5 stats that evolve based on what you do. Gym builds Strength, coding grows Intellect.' },
    { icon: '🔥', title: 'Daily Streaks', desc: 'Keep the fire alive. Consecutive days of activity compound your power.' },
    { icon: '💰', title: 'Gold Economy', desc: 'Earn Gold from quests. Spend it in the Shop on themes, badges, and avatars.' },
    { icon: '👑', title: 'Global Leaderboard', desc: 'Compete with adventurers worldwide. Rise through the rankings.' },
  ];

  return (
    <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
        aria-hidden="true"
      />

      {/* Hero */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '8rem 1rem 6rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: '999px',
            padding: '0.4rem 1.25rem',
            marginBottom: '2rem',
            fontFamily: 'Cinzel, serif',
            fontSize: '0.8rem',
            color: 'var(--gold)',
            letterSpacing: '0.15em',
          }}
        >
          ⚔️ TURN YOUR LIFE INTO AN ADVENTURE
        </div>

        <h1
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            maxWidth: '800px',
          }}
          className="text-gold-gradient"
        >
          Level Up<br />Your Real Life
        </h1>

        <p
          style={{
            maxWidth: '560px',
            color: 'var(--ink-muted)',
            fontSize: '1.2rem',
            lineHeight: 1.7,
            marginBottom: '2.5rem',
          }}
        >
          Complete real-world tasks to earn XP, grow your character stats, and unlock
          rewards. The most epic RPG is the one you live every day.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/register" className="btn btn-primary btn-lg" id="hero-cta">
            🗡️ Begin Your Quest
          </Link>
          <Link href="/login" className="btn btn-secondary btn-lg">
            📜 I Have an Account
          </Link>
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: 'flex',
            gap: '3rem',
            marginTop: '5rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {[
            { num: '∞', label: 'Quests Available' },
            { num: '5', label: 'Character Attributes' },
            { num: '16+', label: 'Shop Items' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: 'var(--gold)',
                }}
              >
                {s.num}
              </div>
              <div style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <hr className="divider-gold" style={{ marginInline: 'auto', maxWidth: '600px' }} />

      {/* Features */}
      <section
        style={{ position: 'relative', zIndex: 1, padding: '5rem 1rem' }}
        aria-labelledby="features-heading"
      >
        <div className="container-app">
          <h2
            id="features-heading"
            style={{
              fontFamily: 'Cinzel, serif',
              textAlign: 'center',
              fontSize: '2rem',
              marginBottom: '0.75rem',
            }}
            className="text-gold-gradient"
          >
            The System
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--ink-muted)', marginBottom: '3rem' }}>
            Everything you need to conquer your goals
          </p>

          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {features.map((f) => (
              <article key={f.title} className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--gold)', marginBottom: '0.75rem', fontSize: '1rem' }}>
                  {f.title}
                </h3>
                <p style={{ color: 'var(--ink-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '5rem 1rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            background: 'var(--parchment-2)',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: '24px',
            padding: '4rem 2rem',
            maxWidth: '600px',
            margin: '0 auto',
            boxShadow: '0 0 60px rgba(201,168,76,0.1)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }} className="animate-float">🏆</div>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.75rem', marginBottom: '1rem' }} className="text-gold-gradient">
            Your Adventure Awaits
          </h2>
          <p style={{ color: 'var(--ink-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
            Join thousands of adventurers turning their daily habits into legendary achievements.
            Free to start. Epic to master.
          </p>
          <Link href="/register" className="btn btn-primary btn-lg">
            ⚔️ Create Your Character
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '2rem 1rem',
          borderTop: '1px solid rgba(201,168,76,0.1)',
          color: 'var(--ink-faint)',
          fontSize: '0.85rem',
        }}
      >
        <p>⚔️ Life RPG — Built for Hackathon 2026 | Fantasy Theme</p>
      </footer>
    </main>
  );
}
