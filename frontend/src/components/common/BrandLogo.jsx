import React from 'react';
import { Link } from 'react-router-dom';

export function BrandLogo({ size = 'default', isDark = false }) {
  const isLarge = size === 'large';

  return (
    <Link
      to="/"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        userSelect: 'none'
      }}
    >
      {/* Theatre Amphitheatre Arc Motif */}
      <svg
        width={isLarge ? "36" : "28"}
        height={isLarge ? "36" : "28"}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M4 22C4 12.0589 12.0589 4 22 4"
          stroke="var(--accent)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M8 24C8 16.268 14.268 10 22 10"
          stroke={isDark ? "rgba(255,255,255,0.85)" : "var(--ink-primary)"}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle
          cx="22"
          cy="16"
          r="2.5"
          fill="var(--accent)"
        />
      </svg>

      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: isLarge ? '1.85rem' : '1.4rem',
          fontWeight: '600',
          letterSpacing: '-0.03em',
          color: isDark ? '#FFFFFF' : 'var(--ink-primary)',
          lineHeight: 1,
        }}
      >
        EVENTRA
      </span>
    </Link>
  );
}
