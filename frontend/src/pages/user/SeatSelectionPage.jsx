import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { seatService } from '../../services/seatService';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { SAMPLE_HYDERABAD_EVENTS, SAMPLE_SEATS } from '../../utils/sampleData';
import { formatCurrency, formatDateFull, formatTime } from '../../utils/formatters';
import { ArrowLeft, AlertCircle, Shield, ArrowRight } from 'lucide-react';

export function SeatSelectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [bookedSeatIds, setBookedSeatIds] = useState(new Set());
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorBanner(null);
      try {
        // 1. Fetch Event
        let eventData = null;
        let isRealBackendEvent = false;
        try {
          eventData = await eventService.getEventById(id);
          if (eventData && eventData.id) {
            isRealBackendEvent = true;
          }
        } catch {
          eventData = SAMPLE_HYDERABAD_EVENTS.find((e) => String(e.id) === String(id));
        }

        if (!eventData) {
          eventData = SAMPLE_HYDERABAD_EVENTS[0];
        }
        setEvent(eventData);

        // 2. Fetch Seats for Venue
        let seatList = [];
        try {
          if (eventData.venue?.id) {
            seatList = await seatService.getSeatsByVenue(eventData.venue.id);
          }
        } catch {
          seatList = [];
        }

        // Only fall back to SAMPLE_SEATS if this is DEMO mode
        if ((!seatList || seatList.length === 0) && !isRealBackendEvent) {
          seatList = SAMPLE_SEATS;
        }
        setSeats(Array.isArray(seatList) ? seatList : []);

        // 3. Check seat booking statuses from backend
        try {
          const seatIds = (seatList || []).map((s) => s.id);
          const bookedSet = await bookingService.getBookedSeatIds(seatIds, eventData.id);
          setBookedSeatIds(bookedSet);
        } catch {
          setBookedSeatIds(new Set());
        }
      } catch (err) {
        console.error('Error loading theatre session', err);
        setEvent(SAMPLE_HYDERABAD_EVENTS[0]);
        setSeats(SAMPLE_SEATS);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const toggleSeat = (seatId) => {
    if (bookedSeatIds.has(seatId)) return;
    setErrorBanner(null);

    setSelectedSeatIds((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      } else {
        if (prev.length >= 8) {
          showToast('Maximum 8 tickets per transaction', 'info');
          return prev;
        }
        return [...prev, seatId];
      }
    });
  };

  const selectedSeats = seats.filter((s) => selectedSeatIds.includes(s.id));
  const subtotal = selectedSeats.reduce((sum, s) => sum + (typeof s.price === 'number' ? s.price : 0), 0);

  const handleProceedToBooking = async () => {
    if (selectedSeatIds.length === 0) {
      showToast('Please select at least one seat to proceed', 'info');
      return;
    }

    if (!isAuthenticated) {
      showToast('Please sign in to confirm your booking', 'info');
      navigate('/login', { state: { from: `/events/${id}/book` } });
      return;
    }

    setBookingLoading(true);
    setErrorBanner(null);

    try {
      const response = await bookingService.createBooking({
        eventId: event.id,
        seatIds: selectedSeatIds,
        userId: user?.id,
      });

      showToast('Seats confirmed! Booking completed.', 'success');
      navigate(`/bookings/${response.bookingId}/confirmation`, {
        state: { booking: response, event },
      });
    } catch (err) {
      const errMsg = err.message || 'Unable to complete reservation. One or more seats may be already taken.';
      setErrorBanner(errMsg);
      showToast(errMsg, 'error');
      
      // Refresh booked seats in case of conflict
      try {
        const seatIds = seats.map((s) => s.id);
        const bookedSet = await bookingService.getBookedSeatIds(seatIds, event.id);
        setBookedSeatIds(bookedSet);
      } catch (_e) {
        // ignore
      }
    } finally {
      setBookingLoading(false);
    }
  };

  // Group seats by row/section
  const groupedRows = seats.reduce((acc, seat) => {
    const rowChar = seat.seatNumber ? seat.seatNumber.charAt(0).toUpperCase() : 'A';
    if (!acc[rowChar]) acc[rowChar] = [];
    acc[rowChar].push(seat);
    return acc;
  }, {});

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
        Preparing Theatre Mode & Seating Grid...
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '120px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Theatre Navigation Top-Bar */}
      <div 
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '16px 0',
          backgroundColor: 'rgba(10, 10, 12, 0.95)',
        }}
      >
        <div 
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link 
              to={`/events/${event.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--theatre-ink-muted)',
                fontSize: '0.85rem',
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Details</span>
            </Link>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
            <div>
              <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#FFF', display: 'block' }}>
                {event.name}
              </span>
              <span className="font-mono" style={{ fontSize: '0.78rem', color: '#8E8E98' }}>
                {formatDateFull(event.eventDate)} · {formatTime(event.startTime)} · {event.venue?.name || 'Hyderabad'}
              </span>
            </div>
          </div>

          <div 
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--accent)',
              border: '1px solid var(--accent-border)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-xs)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            THEATRE MODE
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {errorBanner && (
        <div className="container" style={{ paddingTop: '20px' }}>
          <div 
            style={{
              backgroundColor: 'rgba(216, 58, 32, 0.15)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-xs)',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#FF8A78',
              fontSize: '0.9rem',
              textAlign: 'left',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorBanner}</span>
          </div>
        </div>
      )}

      {/* Main Theatre Workspace */}
      <div className="container" style={{ paddingTop: '40px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 340px', 
            gap: '36px',
            alignItems: 'start',
          }}
          className="theatre-grid"
        >
          {/* Seating Amphitheatre Area */}
          <div 
            style={{
              backgroundColor: 'rgba(20, 20, 26, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-sm)',
              padding: '36px 24px',
              textAlign: 'center',
            }}
          >
            {/* The Curved Stage */}
            <div className="theatre-stage-curve">
              <span className="theatre-stage-label">THE STAGE / ORCHESTRA PIT</span>
            </div>

            {/* Seat Rows Matrix */}
            {seats.length === 0 ? (
              <div style={{ padding: '64px 20px', textAlign: 'center' }}>
                <h3 style={{ color: '#FFFFFF', marginBottom: '10px' }}>Seats Unavailable</h3>
                <p style={{ color: 'var(--theatre-ink-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>
                  Seat inventory and pricing have not been configured for this venue yet. Bookings are not currently open.
                </p>
                <Link to={`/events/${event.id}`} className="btn btn-outline btn-sm">
                  Back to Event Details
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px', margin: '0 auto' }}>
                {Object.keys(groupedRows).map((rowLetter, _rowIndex) => {
                  const rowSeats = groupedRows[rowLetter];
                  const rowSection = rowSeats[0]?.section || 'Standard';
                  const rowPrice = typeof rowSeats[0]?.price === 'number' ? rowSeats[0].price : null;

                  return (
                    <div key={rowLetter} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                      <span
                        className="font-mono"
                        style={{
                          width: '24px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: 'rgba(255,255,255,0.4)',
                          textAlign: 'right'
                        }}
                      >
                        {rowLetter}
                      </span>

                      {/* Seats in this row with slight parabolic curve */}
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {rowSeats.map((seat, _seatIdx) => {
                          const isBooked = bookedSeatIds.has(seat.id);
                          const isSelected = selectedSeatIds.includes(seat.id);

                          return (
                            <button
                              key={seat.id}
                              disabled={isBooked}
                              onClick={() => toggleSeat(seat.id)}
                              className={`seat-button ${
                                isSelected
                                  ? 'seat-selected'
                                  : isBooked
                                  ? 'seat-booked'
                                  : 'seat-available'
                              }`}
                              title={`Seat ${seat.seatNumber} (${rowSection}) - ${typeof seat.price === 'number' ? formatCurrency(seat.price) : 'Unpriced'}`}
                              aria-label={`Seat ${seat.seatNumber}, ${isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}`}
                            >
                              {seat.seatNumber}
                            </button>
                          );
                        })}
                      </div>

                      <span
                        className="font-mono"
                        style={{
                          width: '60px',
                          fontSize: '0.72rem',
                          color: 'rgba(255,255,255,0.3)',
                          textAlign: 'left'
                        }}
                      >
                        {rowPrice != null ? formatCurrency(rowPrice) : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Seat Map Legend */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '24px',
                marginTop: '44px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#8E8E98' }}>
                <span className="seat-button seat-available" style={{ width: '20px', height: '20px', fontSize: '0' }} />
                <span>Available</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#8E8E98' }}>
                <span className="seat-button seat-selected" style={{ width: '20px', height: '20px', fontSize: '0' }} />
                <span>Selected</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#8E8E98' }}>
                <span className="seat-button seat-booked" style={{ width: '20px', height: '20px', fontSize: '0' }} />
                <span>Unavailable / Booked</span>
              </div>
            </div>
          </div>

          {/* Persistent Order & Booking Summary Panel */}
          <div 
            className="theatre-glass"
            style={{
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              textAlign: 'left',
              position: 'sticky',
              top: 'calc(var(--nav-height) + 24px)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', marginBottom: '16px' }}>
              Reservation Summary
            </h3>

            {/* Selected Seats Listing */}
            <div style={{ marginBottom: '20px', minHeight: '80px' }}>
              {selectedSeats.length === 0 ? (
                <div style={{ padding: '20px 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem', fontStyle: 'italic' }}>
                  Select one or more seats on the stage map to calculate your ticket total.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedSeats.map((s) => (
                    <div 
                      key={s.id}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        fontSize: '0.88rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                        paddingBottom: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                          Seat {s.seatNumber}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#8E8E98' }}>
                          ({s.section || 'General'})
                        </span>
                      </div>
                      <span className="font-mono" style={{ color: '#FFFFFF', fontWeight: 500 }}>
                        {formatCurrency(typeof s.price === 'number' ? s.price : 0)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calculations */}
            <div 
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '16px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: '#8E8E98' }}>
                <span>Seats Selected</span>
                <span className="font-mono">{selectedSeats.length} Tickets</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.85rem', color: '#8E8E98' }}>
                <span>Taxes & Fees</span>
                <span className="font-mono">Included</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 600, color: '#FFFFFF' }}>
                <span>Total Due</span>
                <span className="font-mono" style={{ color: 'var(--accent)' }}>
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={handleProceedToBooking}
              disabled={selectedSeats.length === 0 || bookingLoading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              {bookingLoading ? (
                <span>Confirming via API...</span>
              ) : (
                <>
                  <span>CONFIRM & BOOK TICKETS</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div 
              style={{
                marginTop: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              <Shield size={13} style={{ color: 'var(--accent)' }} />
              <span>Instant server-side lock & ticket issuance</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .theatre-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

