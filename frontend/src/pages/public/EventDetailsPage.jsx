import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { seatService, deriveSeatTiers } from '../../services/seatService';
import { SAMPLE_HYDERABAD_EVENTS, SAMPLE_SEATS } from '../../utils/sampleData';
import { getEventImage } from '../../utils/constants';
import { formatDateFull, formatTime, formatCurrency } from '../../utils/formatters';
import { Calendar, Clock, MapPin, Users, ArrowRight, ArrowLeft } from 'lucide-react';

export function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEventData() {
      setLoading(true);
      setError(null);
      try {
        let eventData = null;
        let isRealBackendEvent = false;

        try {
          eventData = await eventService.getEventById(id);
          if (eventData && eventData.id) {
            isRealBackendEvent = true;
          }
        } catch {
          // If backend 404s, allow viewing sample event in demo mode
          const sample = SAMPLE_HYDERABAD_EVENTS.find((e) => String(e.id) === String(id));
          if (sample) {
            eventData = sample;
          } else {
            throw new Error('Performance not found with ID: ' + id);
          }
        }

        if (!eventData) {
          throw new Error('Performance not found with ID: ' + id);
        }

        setEvent(eventData);

        // Fetch actual venue seats
        if (isRealBackendEvent) {
          if (eventData.venue?.id) {
            try {
              const venueSeats = await seatService.getSeatsByVenue(eventData.venue.id);
              // For REAL backend events, only use actual venue seats. Never fall back to SAMPLE_SEATS!
              setSeats(Array.isArray(venueSeats) ? venueSeats : []);
            } catch {
              setSeats([]);
            }
          } else {
            setSeats([]);
          }
        } else {
          // Intentional demo mode for sample events
          setSeats(SAMPLE_SEATS);
        }
      } catch (err) {
        setError(err.message || 'Unable to connect to Eventra server');
      } finally {
        setLoading(false);
      }
    }
    loadEventData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
        Loading production details...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--accent)', marginBottom: '8px' }}>Unable to Load Performance</h2>
        <p style={{ color: 'var(--ink-secondary)', marginBottom: '20px' }}>{error}</p>
        <Link to="/events" className="btn btn-outline btn-sm">
          Back to Discover
        </Link>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Performance Not Found</h2>
        <Link to="/events" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Discover
        </Link>
      </div>
    );
  }

  const eventImage = getEventImage(event.category, event.id);

  // Derive dynamic seat zones and prices from actual venue seats
  const seatTiers = deriveSeatTiers(seats);
  const startingPrice = seatTiers.length > 0
    ? Math.min(...seatTiers.map((t) => t.price))
    : (typeof event.price === 'number' && event.price > 0 ? event.price : null);

  return (
    <div style={{ paddingBottom: '96px' }}>
      {/* Top Breadcrumb */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', padding: '16px 0', backgroundColor: 'var(--bg-paper)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          <Link to="/events" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ink-muted)' }}>
            <ArrowLeft size={14} />
            <span>Discover Events</span>
          </Link>
          <span style={{ color: 'var(--border-strong)' }}>/</span>
          <span style={{ color: 'var(--ink-primary)', fontWeight: 500 }}>{event.name}</span>
        </div>
      </div>

      {/* Main Details Section */}
      <div className="container" style={{ paddingTop: '40px' }}>
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
            gap: '48px',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Visual Poster & Context */}
          <div>
            <div 
              style={{
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-md)',
                marginBottom: '32px',
                position: 'relative',
              }}
            >
              <img 
                src={eventImage} 
                alt={event.name}
                style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block' }}
              />
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(18,18,20,0.8) 0%, transparent 60%)',
                }}
              />
              <div 
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  right: '20px',
                  color: '#FFFFFF',
                }}
              >
                <span className="badge badge-accent" style={{ marginBottom: '8px' }}>
                  {event.category || 'Live Performance'}
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FFF' }}>
                  {event.venue?.name || 'Hyderabad Amphitheatre'}
                </div>
              </div>
            </div>

            {/* About the Production */}
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                About the Event
              </h3>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--ink-secondary)', marginBottom: '24px' }}>
                {event.description || 
                  'Eventra brings you a premier live gathering crafted specifically for the cultural connoisseurs of Hyderabad. Experience an evening of unforgettable performance, acoustic fidelity, and shared emotion.'}
              </p>

              {event.artist && (
                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px 20px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--ink-muted)', display: 'block' }}>
                    Featured Artist / Ensemble
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--ink-primary)' }}>
                    {event.artist}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Timings, Venue, Seat Tiers & Booking CTA */}
          <div style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '28px' }}>
              <span 
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  letterSpacing: '0.1em',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                CONFIRMED STAGE RUN · HYDERABAD
              </span>
              <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', marginBottom: '16px' }}>
                {event.name}
              </h1>
            </div>

            {/* Event Key Info Grid */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xs)',
                padding: '20px',
                marginBottom: '32px',
              }}
            >
              <div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '4px' }}>
                  <Calendar size={14} /> Date
                </span>
                <span className="font-mono" style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--ink-primary)' }}>
                  {formatDateFull(event.eventDate)}
                </span>
              </div>

              <div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '4px' }}>
                  <Clock size={14} /> Time
                </span>
                <span className="font-mono" style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--ink-primary)' }}>
                  {formatTime(event.startTime)} {event.endTime ? `— ${formatTime(event.endTime)}` : ''}
                </span>
              </div>

              <div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '4px' }}>
                  <MapPin size={14} /> Venue
                </span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink-primary)' }}>
                  {event.venue?.name || 'Hyderabad Central Stage'}
                </span>
              </div>

              <div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '4px' }}>
                  <Users size={14} /> Capacity
                </span>
                <span className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink-primary)' }}>
                  {seats.length > 0
                    ? `${seats.length} Seats`
                    : event.venue?.capacity
                    ? `${event.venue.capacity} Capacity`
                    : 'Full Amphitheatre'}
                </span>
              </div>
            </div>

            {/* Pricing Tiers Table */}
            <div style={{ marginBottom: '36px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '14px' }}>
                Tiered Seating Pricing
              </h3>
              <div 
                style={{
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-xs)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-surface)',
                }}
              >
                {seatTiers.length > 0 ? (
                  seatTiers.map((tier, idx) => (
                    <div
                      key={`${tier.name}-${tier.price}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        borderBottom: idx < seatTiers.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{tier.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{tier.note}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                          {formatCurrency(tier.price)}
                        </div>
                        <span className={`badge ${tier.status === 'Available' ? 'badge-open' : 'badge-cancelled'}`}>
                          {tier.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--ink-muted)' }}>
                    <p style={{ margin: 0, fontSize: '0.92rem' }}>
                      Pricing coming soon · Seat inventory has not been configured for this venue yet.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Prominent Action Bar */}
            <div 
              style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <span className="font-mono" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--ink-muted)', display: 'block' }}>
                  {startingPrice != null ? 'Starting Entry' : 'Pricing Status'}
                </span>
                <span className="font-mono" style={{ fontSize: startingPrice != null ? '1.6rem' : '1.15rem', fontWeight: 700, color: startingPrice != null ? 'var(--ink-primary)' : 'var(--ink-muted)' }}>
                  {startingPrice != null ? formatCurrency(startingPrice) : 'Seats unavailable'}
                </span>
              </div>

              <button
                disabled={seatTiers.length === 0 && !startingPrice}
                onClick={() => navigate(`/events/${event.id}/book`)}
                className="btn btn-primary btn-lg"
                style={{
                  padding: '14px 36px',
                  fontWeight: 600,
                  fontSize: '1.05rem',
                  letterSpacing: '0.02em',
                  opacity: seatTiers.length === 0 && !startingPrice ? 0.6 : 1,
                  cursor: seatTiers.length === 0 && !startingPrice ? 'not-allowed' : 'pointer',
                }}
              >
                <span>{seatTiers.length === 0 && !startingPrice ? 'SEATS UNAVAILABLE' : 'CHOOSE SEATS'}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

