import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';

export function Footer() {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-surface)',
        padding: '64px 0 32px 0',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '40px',
            marginBottom: '48px',
            textAlign: 'left',
          }}
        >
          {/* Brand Col */}
          <div>
            <BrandLogo />
            <p
              style={{
                marginTop: '16px',
                fontSize: '0.92rem',
                color: 'var(--ink-secondary)',
                lineHeight: 1.6,
                maxWidth: '280px',
              }}
            >
              Something worth going out for. Curated live performances, stage plays, and concerts across Hyderabad.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-muted)',
                marginBottom: '16px',
              }}
            >
              Navigation
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <Link to="/events" style={{ color: 'var(--ink-secondary)' }}>Discover All Events</Link>
              <Link to="/venues" style={{ color: 'var(--ink-secondary)' }}>Hyderabad Venues</Link>
              <Link to="/my-bookings" style={{ color: 'var(--ink-secondary)' }}>My Bookings</Link>
              <Link to="/login" style={{ color: 'var(--ink-secondary)' }}>Member Login</Link>
            </div>
          </div>

          {/* Hyderabad Venues */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-muted)',
                marginBottom: '16px',
              }}
            >
              Featured Areas
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--ink-secondary)' }}>
              <span>Gachibowli Amphitheatre</span>
              <span>Ravindra Bharathi Auditorium</span>
              <span>Shilpakala Vedika, Hitec City</span>
              <span>Hitex Exhibition Center</span>
            </div>
          </div>

          {/* Architecture info */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-muted)',
                marginBottom: '16px',
              }}
            >
              Platform Identity
            </h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)', lineHeight: 1.6 }}>
              Editorial by Day. Theatre by Night. Powered by Spring Boot 21 stateless REST API & modern React interface.
            </p>
          </div>
        </div>

        {/* Copyright & Technical Sub-line */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.8rem',
            color: 'var(--ink-faint)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span>© {new Date().getFullYear()} EVENTRA TICKETING INC. ALL RIGHTS RESERVED.</span>
          <span>HYDERABAD EDITION · SYSTEM STATUS: ONLINE</span>
        </div>
      </div>
    </footer>
  );
}

