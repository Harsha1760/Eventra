import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatDateShort, formatDateFull, formatCurrency, formatBookingRef } from '../../utils/formatters';
import { Ticket, AlertCircle } from 'lucide-react';

export function MyBookingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, CONFIRMED, CANCELLED
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    async function loadUserBookings() {
      if (!user?.id) return;
      setLoading(true);
      try {
        const data = await bookingService.getUserBookings(user.id);
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load user bookings', err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }
    loadUserBookings();
  }, [user?.id]);

  const handleOpenCancelModal = (bookingId) => {
    setCancellingBookingId(bookingId);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBookingId) return;
    setCancelLoading(true);
    try {
      await bookingService.cancelBooking(cancellingBookingId);
      showToast('Booking cancelled successfully', 'info');
      
      // Update booking status in local state
      setBookings((prev) =>
        prev.map((b) => (b.bookingId === cancellingBookingId ? { ...b, status: 'CANCELLED' } : b))
      );
      setShowCancelModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    } finally {
      setCancelLoading(false);
      setCancellingBookingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'CONFIRMED') return b.status === 'CONFIRMED';
    if (activeTab === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  return (
    <div style={{ padding: '48px 0 96px 0', backgroundColor: 'var(--bg-paper)' }}>
      <div className="container">
        {/* Header */}
        <div 
          style={{
            borderBottom: '2px solid var(--ink-primary)',
            paddingBottom: '20px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
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
              MEMBER ACCOUNT
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', margin: 0 }}>
              My Bookings & Passes
            </h1>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'CONFIRMED', 'CANCELLED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  fontWeight: activeTab === tab ? 600 : 400,
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: activeTab === tab ? 'var(--ink-primary)' : 'var(--bg-surface)',
                  color: activeTab === tab ? '#FFFFFF' : 'var(--ink-secondary)',
                  border: '1px solid var(--border-default)',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        <div
          style={{
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          {loading ? (
            <div style={{ padding: '64px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
              Loading booking records from backend...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div style={{ padding: '64px 20px', textAlign: 'center' }}>
              <Ticket size={36} style={{ color: 'var(--ink-faint)', marginBottom: '16px' }} />
              <h3 style={{ marginBottom: '8px' }}>No bookings found</h3>
              <p style={{ color: 'var(--ink-secondary)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px auto' }}>
                You have no active reservations in this tab. Explore our live calendar to reserve seats.
              </p>
              <Link to="/events" className="btn btn-primary">
                Browse Live Events
              </Link>
            </div>
          ) : (
            filteredBookings.map((b) => {
              const dateInfo = formatDateShort(b.bookingDate);
              const isConfirmed = b.status === 'CONFIRMED';

              return (
                <div
                  key={b.bookingId}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '85px 1fr auto auto',
                    alignItems: 'center',
                    gap: '24px',
                    padding: '24px 20px',
                    borderBottom: '1px solid var(--border-subtle)',
                    textAlign: 'left',
                  }}
                >
                  {/* Date badge */}
                  <div className="event-row-date">
                    <span className="event-row-date-day">{dateInfo.day}</span>
                    <span className="event-row-date-month">{dateInfo.month}</span>
                  </div>

                  {/* Info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                        {formatBookingRef(b.bookingId)}
                      </span>
                      <span className={`badge ${isConfirmed ? 'badge-open' : 'badge-cancelled'}`}>
                        {b.status}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', marginBottom: '4px', color: 'var(--ink-primary)' }}>
                      {b.eventName || 'Live Performance'}
                    </h3>

                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.86rem', color: 'var(--ink-secondary)', flexWrap: 'wrap' }}>
                      <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                        Seats: {b.seatNumbers?.join(', ') || 'Reserved'}
                      </span>
                      <span>•</span>
                      <span>Booked: {formatDateFull(b.bookingDate)}</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="event-row-price">
                    <span className="event-row-price-label">Total Paid</span>
                    <span className="event-row-price-val font-mono">{formatCurrency(b.totalAmount)}</span>
                  </div>

                  {/* Action */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Link
                      to={`/bookings/${b.bookingId}/confirmation`}
                      state={{ booking: b }}
                      className="btn btn-outline btn-sm"
                    >
                      View Ticket
                    </Link>

                    {isConfirmed && (
                      <button
                        onClick={() => handleOpenCancelModal(b.bookingId)}
                        className="btn btn-danger btn-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(18, 18, 20, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              maxWidth: '460px',
              width: '100%',
              padding: '28px',
              textAlign: 'left',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent)', marginBottom: '14px' }}>
              <AlertCircle size={22} />
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Cancel Reservation</h3>
            </div>
            <p style={{ color: 'var(--ink-secondary)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '24px' }}>
              Are you sure you want to cancel booking <strong className="font-mono">{formatBookingRef(cancellingBookingId)}</strong>? 
              This will release your allocated seats immediately. Cancelled bookings will remain in your history.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                disabled={cancelLoading}
                onClick={() => setShowCancelModal(false)}
                className="btn btn-outline btn-sm"
              >
                Keep Booking
              </button>
              <button
                disabled={cancelLoading}
                onClick={handleConfirmCancel}
                className="btn btn-danger btn-sm"
              >
                {cancelLoading ? 'Cancelling via API...' : 'Yes, Cancel Reservation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

