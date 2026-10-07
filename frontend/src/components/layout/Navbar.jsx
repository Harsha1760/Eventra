import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BrandLogo } from '../common/BrandLogo';
import { Search, MapPin, User, LogOut, Shield, Ticket, Menu, X } from 'lucide-react';

export function Navbar({ isTheatreMode = false }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: isTheatreMode ? 'rgba(10, 10, 12, 0.88)' : 'rgba(248, 247, 244, 0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${isTheatreMode ? 'rgba(255, 255, 255, 0.08)' : 'var(--border-subtle)'}`,
        height: 'var(--nav-height)',
        display: 'flex',
        alignItems: 'center',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      <div 
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Brand + Location + Primary Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <BrandLogo isDark={isTheatreMode} />

          {/* City Badge */}
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              fontWeight: 500,
              padding: '4px 10px',
              borderRadius: 'var(--radius-xs)',
              border: `1px solid ${isTheatreMode ? 'rgba(255,255,255,0.1)' : 'var(--border-default)'}`,
              color: isTheatreMode ? '#A6A5AE' : 'var(--ink-secondary)',
              backgroundColor: isTheatreMode ? 'rgba(255,255,255,0.03)' : 'var(--bg-surface)',
            }}
          >
            <MapPin size={12} style={{ color: 'var(--accent)' }} />
            <span>HYDERABAD</span>
          </div>

          {/* Nav Links */}
          <nav 
            style={{ 
              display: 'none', 
              gap: '24px', 
              alignItems: 'center' 
            }}
            className="desktop-nav"
          >
            <Link
              to="/events"
              style={{
                fontSize: '0.92rem',
                fontWeight: isActive('/events') ? 600 : 500,
                color: isActive('/events')
                  ? 'var(--accent)'
                  : isTheatreMode ? '#D4D3D9' : 'var(--ink-primary)',
              }}
            >
              Discover
            </Link>
            <Link
              to="/venues"
              style={{
                fontSize: '0.92rem',
                fontWeight: isActive('/venues') ? 600 : 500,
                color: isActive('/venues')
                  ? 'var(--accent)'
                  : isTheatreMode ? '#D4D3D9' : 'var(--ink-primary)',
              }}
            >
              Venues
            </Link>
          </nav>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            to="/events"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-xs)',
              border: `1px solid ${isTheatreMode ? 'rgba(255,255,255,0.1)' : 'var(--border-default)'}`,
              color: isTheatreMode ? '#D4D3D9' : 'var(--ink-secondary)',
            }}
            title="Search events"
          >
            <Search size={16} />
          </Link>

          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="btn btn-outline btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderColor: isTheatreMode ? 'rgba(255,255,255,0.15)' : 'var(--border-default)',
                  color: isTheatreMode ? '#F5F5F7' : 'var(--ink-primary)',
                  backgroundColor: isTheatreMode ? 'rgba(255,255,255,0.05)' : 'var(--bg-surface)',
                }}
              >
                <User size={14} />
                <span>{user?.name?.split(' ')[0] || 'Account'}</span>
                {isAdmin && (
                  <span 
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      background: 'var(--accent)',
                      color: '#FFF',
                      padding: '1px 5px',
                      borderRadius: '2px'
                    }}
                  >
                    ADMIN
                  </span>
                )}
              </button>

              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '210px',
                    backgroundColor: isTheatreMode ? '#141418' : 'var(--bg-surface)',
                    border: `1px solid ${isTheatreMode ? 'rgba(255,255,255,0.1)' : 'var(--border-default)'}`,
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '8px 0',
                    zIndex: 60,
                    textAlign: 'left',
                  }}
                >
                  <div style={{ padding: '8px 16px', borderBottom: `1px solid ${isTheatreMode ? 'rgba(255,255,255,0.06)' : 'var(--border-subtle)'}` }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isTheatreMode ? '#FFF' : 'var(--ink-primary)' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: isTheatreMode ? '#8E8E98' : 'var(--ink-muted)' }}>{user?.email}</div>
                  </div>

                  <Link
                    to="/my-bookings"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 16px',
                      fontSize: '0.86rem',
                      color: isTheatreMode ? '#D4D3D9' : 'var(--ink-primary)',
                    }}
                  >
                    <Ticket size={14} />
                    <span>My Bookings</span>
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 16px',
                      fontSize: '0.86rem',
                      color: isTheatreMode ? '#D4D3D9' : 'var(--ink-primary)',
                    }}
                  >
                    <User size={14} />
                    <span>Profile & Password</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 16px',
                        fontSize: '0.86rem',
                        color: 'var(--accent)',
                        fontWeight: 600,
                      }}
                    >
                      <Shield size={14} />
                      <span>Admin Control</span>
                    </Link>
                  )}

                  <div style={{ borderTop: `1px solid ${isTheatreMode ? 'rgba(255,255,255,0.06)' : 'var(--border-subtle)'}`, margin: '6px 0' }} />

                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '8px 16px',
                      fontSize: '0.86rem',
                      color: '#E53E24',
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link 
                to="/login" 
                className="btn btn-outline btn-sm"
                style={{
                  borderColor: isTheatreMode ? 'rgba(255,255,255,0.15)' : 'var(--border-default)',
                  color: isTheatreMode ? '#F5F5F7' : 'var(--ink-primary)',
                }}
              >
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isTheatreMode ? '#F5F5F7' : 'var(--ink-primary)',
            }}
            className="mobile-toggle"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'var(--nav-height)',
            left: 0,
            right: 0,
            backgroundColor: isTheatreMode ? '#101014' : 'var(--bg-surface)',
            borderBottom: `1px solid ${isTheatreMode ? 'rgba(255,255,255,0.1)' : 'var(--border-default)'}`,
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1.05rem', fontWeight: 500 }}
          >
            Discover Events
          </Link>
          <Link
            to="/venues"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1.05rem', fontWeight: 500 }}
          >
            Explore Venues
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '1.05rem', fontWeight: 500 }}
              >
                My Bookings
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '1.05rem', fontWeight: 500 }}
              >
                Profile & Security
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--accent)' }}
                >
                  Admin Management
                </Link>
              )}
            </>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </header>
  );
}

