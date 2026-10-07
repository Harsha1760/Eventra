import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BrandLogo } from '../components/common/BrandLogo';
import { Shield, Calendar, MapPin, Grid, Users, Ticket, ArrowLeft } from 'lucide-react';

export function AdminLayout() {
  const { user } = useAuth();

  const navLinks = [
    { to: '/admin', label: 'Overview', icon: Shield, end: true },
    { to: '/admin/events', label: 'Events', icon: Calendar },
    { to: '/admin/venues', label: 'Venues', icon: MapPin },
    { to: '/admin/seats', label: 'Seats', icon: Grid },
    { to: '/admin/bookings', label: 'Bookings', icon: Ticket },
    { to: '/admin/users', label: 'Users', icon: Users },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-paper)' }}>
      {/* Admin Top Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border-default)',
          backgroundColor: '#FFFFFF',
          padding: '16px 0',
        }}
      >
        <div 
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <BrandLogo />
            <span 
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent)',
                border: '1px solid var(--accent-border)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-xs)',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              ADMIN CONSOLE
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)' }}>
              Logged in as <strong style={{ color: 'var(--ink-primary)' }}>{user?.name}</strong>
            </span>
            <Link 
              to="/" 
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={13} />
              <span>Back to App</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Horizontal Tabs Bar */}
      <div 
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          padding: '4px 0',
        }}
      >
        <div className="container" style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--accent)' : 'var(--ink-secondary)',
                  borderBottom: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                })}
              >
                <Icon size={14} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Main Admin Content Container */}
      <main className="container" style={{ flex: 1, padding: '36px 24px 80px 24px' }}>
        <Outlet />
      </main>
    </div>
  );
}

