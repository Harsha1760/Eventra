import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';

export function TheatreLayout() {
  return (
    <div className="theatre-mode" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar isTheatreMode={true} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
    </div>
  );
}

