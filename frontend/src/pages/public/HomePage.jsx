import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { seatService } from '../../services/seatService';
import { SAMPLE_HYDERABAD_EVENTS } from '../../utils/sampleData';
import { getEventImage } from '../../utils/constants';
import { EventRow } from '../../components/events/EventRow';
import { formatDateFull, formatCurrency } from '../../utils/formatters';
import { Search, MapPin, ArrowRight } from 'lucide-react';

export function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, venuePrices] = await Promise.all([
        eventService.getAllEvents(),
        seatService.getVenuePriceMap(),
      ]);
      if (Array.isArray(data) && data.length > 0) {
        // Enrich events with actual starting prices derived from seats
        const enriched = data.map((evt) => {
          const venueMinPrice = evt.venue?.id ? venuePrices.get(String(evt.venue.id)) : null;
          return {
            ...evt,
            startingPrice: venueMinPrice ?? (typeof evt.price === 'number' && evt.price > 0 ? evt.price : null),
          };
        });
        setEvents(enriched);
      } else {
        // API succeeded, but database contains no records yet -> preview curated records
        setEvents(SAMPLE_HYDERABAD_EVENTS);
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to Eventra server');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Filter logic
  const filteredEvents = events.filter((evt) => {
    const matchesSearch = 
      evt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.artist && evt.artist.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (evt.venue?.name && evt.venue.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      selectedCategory === 'ALL' || 
      (evt.category && evt.category.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  const featuredEvent = events[0] || SAMPLE_HYDERABAD_EVENTS[0];
  const featuredStartingPrice = featuredEvent?.startingPrice ?? (typeof featuredEvent?.price === 'number' && featuredEvent.price > 0 ? featuredEvent.price : null);
  const featuredImage = getEventImage(featuredEvent?.category, featuredEvent?.id);

  return (
    <div style={{ paddingBottom: '96px' }}>
      {/* ================================================================
          1. EDITORIAL HERO & OPENING MANIFESTO
          ================================================================ */}
      <section 
        style={{
          borderBottom: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-paper)',
          padding: '64px 0 48px 0',
          position: 'relative',
        }}
      >
        <div className="container">
          {/* Top Editorial Eyebrow */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '28px',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '14px',
            }}
          >
            <div 
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                letterSpacing: '0.12em',
                color: 'var(--accent)',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              HYDERABAD EDITION · ISSUE 2026
            </div>
            <div 
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: 'var(--ink-muted)',
                letterSpacing: '0.05em',
              }}
            >
              EDITORIAL BY DAY. THEATRE BY NIGHT.
            </div>
          </div>

          {/* Main Headline */}
          <div style={{ maxWidth: '980px', marginBottom: '40px', textAlign: 'left' }}>
            <h1 
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.8rem, 6vw, 4.8rem)',
                lineHeight: 1.04,
                letterSpacing: '-0.035em',
                color: 'var(--ink-primary)',
                marginBottom: '20px',
              }}
            >
              Something worth <br />
              <span style={{ fontStyle: 'italic', fontWeight: 400 }}>going out for.</span>
            </h1>
            <p 
              style={{
                fontSize: 'clamp(1.05rem, 1.8vw, 1.3rem)',
                color: 'var(--ink-secondary)',
                lineHeight: 1.5,
                maxWidth: '680px',
              }}
            >
              Curated classical concerts, historic court dramas, live indie residencies, 
              and stand-up showcases across the Twin Cities.
            </p>
          </div>

          {/* Selective Glassmorphism Floating Discovery Controller */}
          <div 
            className="glass-panel"
            style={{
              borderRadius: 'var(--radius-sm)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            {/* Quick Date Selectors */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span 
                style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '0.75rem', 
                  color: 'var(--ink-muted)', 
                  textTransform: 'uppercase',
                  marginRight: '6px' 
                }}
              >
                When:
              </span>
              {['ALL', 'TODAY', 'THIS WEEKEND', 'THIS MONTH'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedDateFilter(filter)}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    fontWeight: selectedDateFilter === filter ? 600 : 400,
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: selectedDateFilter === filter ? 'var(--ink-primary)' : 'rgba(255,255,255,0.7)',
                    color: selectedDateFilter === filter ? '#FFFFFF' : 'var(--ink-secondary)',
                    border: '1px solid var(--border-default)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Integrated Search Input */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                flex: '1', 
                minWidth: '240px',
                maxWidth: '360px',
                position: 'relative'
              }}
            >
              <Search 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  color: 'var(--ink-muted)' 
                }} 
              />
              <input
                type="text"
                placeholder="Search event, artist, or venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          2. FEATURED / LEAD PRODUCTION SHOWCASE
          ================================================================ */}
      {featuredEvent && (
        <section style={{ padding: '64px 0 40px 0' }}>
          <div className="container">
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span 
                  style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--accent)' 
                  }} 
                />
                <span 
                  style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '0.78rem', 
                    letterSpacing: '0.08em', 
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  Lead Feature Production
                </span>
              </div>
              <Link 
                to={`/events/${featuredEvent.id}`}
                style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '0.82rem', 
                  color: 'var(--accent)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Full Details</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Split Lead Showcase Card */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {/* Image side with selective atmospheric overlay */}
              <div 
                style={{
                  position: 'relative',
                  minHeight: '380px',
                  backgroundImage: `url(${featuredImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div 
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(18,18,20,0.85) 0%, rgba(18,18,20,0.2) 60%, transparent 100%)',
                  }} 
                />

                {/* Date Chip on image */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    backgroundColor: 'rgba(18, 18, 20, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-xs)',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                  }}
                >
                  {formatDateFull(featuredEvent.eventDate)}
                </div>

                {/* Venue tag on bottom left */}
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.88rem',
                  }}
                >
                  <MapPin size={15} style={{ color: 'var(--accent)' }} />
                  <span>{featuredEvent.venue?.name || 'Hyderabad Amphitheatre'}</span>
                </div>
              </div>

              {/* Text / Context side */}
              <div 
                style={{
                  padding: '40px 36px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div 
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--accent)',
                      marginBottom: '10px',
                      fontWeight: 600,
                    }}
                  >
                    {featuredEvent.category || 'Curated Performance'}
                  </div>

                  <h2 
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '2.2rem',
                      lineHeight: 1.15,
                      marginBottom: '14px',
                    }}
                  >
                    {featuredEvent.name}
                  </h2>

                  {featuredEvent.artist && (
                    <div 
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 500,
                        color: 'var(--ink-primary)',
                        marginBottom: '16px',
                      }}
                    >
                      Featuring {featuredEvent.artist}
                    </div>
                  )}

                  <p 
                    style={{
                      fontSize: '0.96rem',
                      color: 'var(--ink-secondary)',
                      lineHeight: 1.6,
                      marginBottom: '24px',
                    }}
                  >
                    {featuredEvent.description || 
                      'Experience an unforgettable evening of live stage artistry and cultural excellence.'}
                  </p>
                </div>

                {/* Bottom Pricing & Direct Seat Reservation */}
                <div 
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div>
                    <span 
                      style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '0.72rem', 
                        color: 'var(--ink-muted)',
                        textTransform: 'uppercase',
                        display: 'block' 
                      }}
                    >
                      {featuredStartingPrice ? 'Tickets From' : 'Tickets'}
                    </span>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: featuredStartingPrice ? '1.45rem' : '1.05rem',
                        fontWeight: 600,
                        color: featuredStartingPrice ? 'var(--ink-primary)' : 'var(--ink-muted)'
                      }}
                    >
                      {featuredStartingPrice ? formatCurrency(featuredStartingPrice) : 'Pricing coming soon'}
                    </span>
                  </div>

                  <Link 
                    to={`/events/${featuredEvent.id}/book`}
                    className="btn btn-primary"
                    style={{ padding: '12px 24px' }}
                  >
                    <span>Reserve Seats</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          3. CATEGORY SELECTOR CHIPS
          ================================================================ */}
      <section style={{ padding: '24px 0 16px 0' }}>
        <div className="container">
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              overflowX: 'auto',
              paddingBottom: '8px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {['ALL', 'Music', 'Theatre', 'Comedy'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: selectedCategory === cat ? 600 : 500,
                  padding: '7px 18px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: selectedCategory === cat ? 'var(--accent)' : 'var(--bg-surface)',
                  color: selectedCategory === cat ? '#FFFFFF' : 'var(--ink-secondary)',
                  border: `1px solid ${selectedCategory === cat ? 'var(--accent)' : 'var(--border-default)'}`,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat === 'ALL' ? 'All Formats' : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          4. THE EDITORIAL EVENT REGISTRY (Signature EventRows)
          ================================================================ */}
      <section style={{ padding: '36px 0 64px 0' }}>
        <div className="container">
          <div 
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: '20px',
              borderBottom: '2px solid var(--ink-primary)',
              paddingBottom: '10px',
            }}
          >
            <h2 style={{ fontSize: '1.8rem', letterSpacing: '-0.02em' }}>
              The Live Registry
            </h2>
            <span 
              className="font-mono"
              style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}
            >
              Showing {filteredEvents.length} Performances
            </span>
          </div>

          {/* EventRow List */}
          <div 
            style={{
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xs)',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                Loading live schedules from backend...
              </div>
            ) : error ? (
              <div style={{ padding: '54px 20px', textAlign: 'center' }}>
                <p style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '8px' }}>
                  Connection Error: {error}
                </p>
                <p style={{ color: 'var(--ink-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Please ensure the Spring Boot server is running on port 4040.
                </p>
                <button onClick={loadEvents} className="btn btn-outline btn-sm">
                  Retry Connection
                </button>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div style={{ padding: '54px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: '1.05rem', color: 'var(--ink-secondary)', marginBottom: '12px' }}>
                  No performances match your current filter.
                </p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
                  className="btn btn-outline btn-sm"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredEvents.map((evt) => (
                <EventRow 
                  key={evt.id} 
                  event={evt} 
                  actionLabel="Book Seats"
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ================================================================
          5. THEATRE MODE TRANSITION TEASER
          ================================================================ */}
      <section 
        style={{
          backgroundColor: '#09090C',
          color: '#F5F5F7',
          padding: '64px 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container">
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '40px',
              alignItems: 'center',
            }}
          >
            <div>
              <div 
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  letterSpacing: '0.12em',
                  color: 'var(--accent)',
                  textTransform: 'uppercase',
                  marginBottom: '14px',
                }}
              >
                Signature Experience
              </div>
              <h2 
                style={{
                  fontFamily: 'var(--font-display)',
                  color: '#FFFFFF',
                  fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                  lineHeight: 1.15,
                  marginBottom: '16px',
                }}
              >
                Entering Theatre Mode.
              </h2>
              <p style={{ color: '#A6A5AE', fontSize: '1rem', lineHeight: 1.6, marginBottom: '28px' }}>
                When you choose your seats, Eventra transforms. Lights dim, the stage curves into view, 
                and you select your exact row and tier in a focused, distraction-free environment.
              </p>
              <Link 
                to={`/events/${featuredEvent.id}/book`}
                className="btn btn-primary"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <span>Experience Seat Selection</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Visual Arc Graphic */}
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '30px',
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div className="theatre-stage-curve" style={{ width: '90%', marginBottom: '24px' }}>
                <span className="theatre-stage-label" style={{ backgroundColor: '#09090C' }}>STAGE</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <span className="seat-button seat-available">A1</span>
                <span className="seat-button seat-available">A2</span>
                <span className="seat-button seat-selected">A3</span>
                <span className="seat-button seat-selected">A4</span>
                <span className="seat-button seat-available">A5</span>
              </div>
              <span className="font-mono" style={{ fontSize: '0.75rem', color: '#74737E' }}>
                LIVE SEAT AVAILABILITY INTEGRATION
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

