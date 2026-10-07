import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../../components/common/BrandLogo';

export function NotFoundPage() {
  return (
    <div 
      style={{ 
        padding: '96px 20px', 
        textAlign: 'center', 
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <BrandLogo size="large" />
      <div className="font-mono" style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--accent)', marginTop: '24px', lineHeight: 1 }}>
        404
      </div>
      <h2 style={{ fontSize: '1.8rem', marginTop: '12px', marginBottom: '8px' }}>
        Performance or Page Not Found
      </h2>
      <p style={{ color: 'var(--ink-secondary)', maxWidth: '420px', marginBottom: '28px' }}>
        The stage you are looking for does not exist or may have completed its scheduled run.
      </p>
      <Link to="/" className="btn btn-primary">
        Return to Home Discovery
      </Link>
    </div>
  );
}

