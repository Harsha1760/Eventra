import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { venueService } from '../../services/venueService';
import { MapPin, Users, ArrowRight } from 'lucide-react';

export function VenuesPage() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadVenues = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await venueService.getAllVenues();
      if (Array.isArray(data) && data.length > 0) {
        setVenues(data);
      } else {
        // API succeeded, but database contains no records -> preview curated sample
        setVenues([
          { id: 1, name: 'Ravindra Bharathi Auditorium', location: 'Saifabad, Hyderabad', capacity: 1100 },
          { id: 2, name: 'Chowmahalla Palace Amphitheatre', location: 'Khilwat, Old City, Hyderabad', capacity: 850 },
          { id: 3, name: 'Shilpakala Vedika', location: 'Hitec City, Hyderabad', capacity: 2500 },
          { id: 4, name: 'Gachibowli Amphitheatre', location: 'Gachibowli, Hyderabad', capacity: 3500 },
        ]);
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to Eventra server');
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVenues();
  }, []);

  return (
    <div style={{ padding: '48px 0 96px 0', backgroundColor: 'var(--bg-paper)' }}>
      <div className="container">
        {/* Header */}
        <div 
          style={{
            borderBottom: '2px solid var(--ink-primary)',
            paddingBottom: '20px',
            marginBottom: '36px',
            textAlign: 'left',
          }}
        >
          <div 
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              letterSpacing: '0.1em',
              color: 'var(--accent)',
              fontWeight: 600,
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            SPATIAL HERITAGE · HYDERABAD
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', margin: 0 }}>
            Iconic Cultural Venues
          </h1>
        </div>

        {/* Venues Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            textAlign: 'left',
          }}
        >
          {loading ? (
            <div style={{ padding: '48px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
              Loading Hyderabad venues...
            </div>
          ) : error ? (
            <div style={{ padding: '48px 20px', gridColumn: '1 / -1', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--accent)', marginBottom: '8px' }}>Connection Error</h3>
              <p style={{ color: 'var(--ink-secondary)', marginBottom: '16px' }}>{error}</p>
              <button onClick={loadVenues} className="btn btn-outline btn-sm">
                Retry Connection
              </button>
            </div>
          ) : (
            venues.map((venue) => (
              <div
                key={venue.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '200px',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.18s ease, border-color 0.18s ease',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.35rem', marginBottom: '8px', color: 'var(--ink-primary)' }}>
                    {venue.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ink-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                    <MapPin size={14} style={{ color: 'var(--accent)' }} />
                    <span>{venue.location}</span>
                  </div>
                </div>

                <div 
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={14} style={{ color: 'var(--ink-muted)' }} />
                    <span className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--ink-primary)', fontWeight: 600 }}>
                      {venue.capacity ? `${venue.capacity} Capacity` : 'Auditorium'}
                    </span>
                  </div>

                  <Link
                    to={`/events?search=${encodeURIComponent(venue.name)}`}
                    className="btn btn-outline btn-sm"
                  >
                    <span>View Events</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

