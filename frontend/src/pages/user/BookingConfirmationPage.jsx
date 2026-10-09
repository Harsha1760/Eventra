import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { formatDateFull, formatTime, formatCurrency, formatBookingRef } from '../../utils/formatters';
import { Check, ArrowRight, Printer } from 'lucide-react';

export function BookingConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();
  const booking = location.state?.booking;
  const event = location.state?.event;

  const bookingRef = formatBookingRef(id || booking?.bookingId);
  const eventName = booking?.eventName || event?.name || 'Symphony of the Deccan';
  const seatNumbers = booking?.seatNumbers || ['A3', 'A4'];
  const totalAmount = booking?.totalAmount != null ? booking.totalAmount : 0;
  const bookingDate = booking?.bookingDate ? formatDateFull(booking.bookingDate) : 'Today';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: '64px 0 96px 0', backgroundColor: 'var(--bg-paper)' }}>
      <div className="container-narrow">
        {/* Subtle Top Confirmed Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'var(--status-success-text)',
              backgroundColor: 'var(--status-success-bg)',
              border: '1px solid var(--status-success-border)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-xs)',
              marginBottom: '16px',
            }}
          >
            <Check size={14} />
            <span>RESERVATION CONFIRMED & ISSUED</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', marginBottom: '10px' }}>
            Your Ticket Pass
          </h1>
          <p style={{ color: 'var(--ink-secondary)', fontSize: '0.98rem' }}>
            Booking reference <span className="font-mono" style={{ fontWeight: 600, color: 'var(--ink-primary)' }}>{bookingRef}</span> is verified on the blockchain and saved to your account.
          </p>
        </div>

        {/* Digital Ticket Stub (Architectural Perforation Motif) */}
        <div className="ticket-stub" style={{ textAlign: 'left', marginBottom: '32px' }}>
          {/* Top Ticket Header */}
          <div style={{ padding: '32px 36px 20px 36px', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div 
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.12em',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                EVENTRA DIGITAL PASS · HYDERABAD
              </div>
              <span className="badge badge-open">CONFIRMED</span>
            </div>

            <h2 style={{ fontSize: '1.9rem', marginBottom: '10px', color: 'var(--ink-primary)' }}>
              {eventName}
            </h2>

            {event?.artist && (
              <div style={{ fontSize: '0.95rem', color: 'var(--ink-secondary)', marginBottom: '8px' }}>
                Performer: <strong style={{ color: 'var(--ink-primary)' }}>{event.artist}</strong>
              </div>
            )}
          </div>

          {/* Ticket Perforation Dashed Line */}
          <div className="ticket-stub-perforation" />

          {/* Middle Details Grid */}
          <div style={{ padding: '16px 36px 32px 36px', backgroundColor: '#FFFFFF' }}>
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '24px',
                marginBottom: '28px',
              }}
            >
              <div>
                <span className="form-label">Date & Timing</span>
                <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink-primary)' }}>
                  {event?.eventDate ? formatDateFull(event.eventDate) : 'Upcoming Performance'}
                </div>
                <div className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
                  {event?.startTime ? formatTime(event.startTime) : '19:30 IST'}
                </div>
              </div>

              <div>
                <span className="form-label">Venue</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink-primary)' }}>
                  {event?.venue?.name || 'Hyderabad Amphitheatre'}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
                  {event?.venue?.location || 'Saifabad, Hyderabad'}
                </div>
              </div>

              <div>
                <span className="form-label">Allocated Seats</span>
                <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>
                  {seatNumbers.join(', ')}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                  {seatNumbers.length} Reserved Pass{seatNumbers.length > 1 ? 'es' : ''}
                </div>
              </div>

              <div>
                <span className="form-label">Total Amount</span>
                <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-primary)' }}>
                  {formatCurrency(totalAmount)}
                </div>
                <div className="badge badge-subtle" style={{ fontSize: '0.68rem', marginTop: '4px' }}>
                  PAID VIA BACKEND
                </div>
              </div>
            </div>

            {/* Simulated Barcode / Optical Scan Block */}
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
                <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', letterSpacing: '0.2em' }}>
                  ||| ||||| || |||||| |||| ||| ||||||| |||| || |||
                </div>
                <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--ink-faint)', marginTop: '4px' }}>
                  {bookingRef} · ISSUED: {bookingDate} · AUTH-TOKEN VERIFIED
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handlePrint} className="btn btn-outline btn-sm">
                  <Printer size={14} />
                  <span>Print Ticket</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/my-bookings" className="btn btn-primary">
            <span>View All My Bookings</span>
            <ArrowRight size={15} />
          </Link>
          <Link to="/events" className="btn btn-outline">
            Discover More Events
          </Link>
        </div>
      </div>
    </div>
  );
}

