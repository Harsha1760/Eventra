import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDateShort, formatCurrency, formatTime } from '../../utils/formatters';
import { MapPin, ArrowRight } from 'lucide-react';

export function EventRow({ 
  event, 
  variant = 'default',
  actionLabel = 'Book Seats',
  onAction,
  bookingDetails,
  customBadge,
}) {
  const navigate = useNavigate();
  if (!event) return null;

  const dateShort = formatDateShort(event.eventDate || bookingDetails?.bookingDate);
  const venueName = event.venue?.name || 'Hyderabad Amphitheatre';
  const location = event.venue?.location ? `${event.venue.location} · Hyderabad` : 'Hyderabad';
  
  // Starting price derived from actual seat pricing or booking total
  const validPrice =
    typeof event.startingPrice === 'number' && event.startingPrice > 0
      ? event.startingPrice
      : typeof event.price === 'number' && event.price > 0
        ? event.price
        : null;

  const priceLabel = variant === 'booking' ? 'Total Paid' : (validPrice != null ? 'From' : '');
  const priceDisplay = bookingDetails?.totalAmount != null
    ? formatCurrency(bookingDetails.totalAmount)
    : validPrice != null
      ? formatCurrency(validPrice)
      : 'Pricing coming soon';

  const handleRowClick = () => {
    if (variant === 'booking' && bookingDetails) {
      // Do nothing or open details
    } else if (onAction) {
      onAction(event);
    } else {
      navigate(`/events/${event.id}`);
    }
  };

  return (
    <article
      className="event-row"
      onClick={handleRowClick}
      style={{
        cursor: 'pointer',
        position: 'relative',
        ...(variant === 'compact' ? { padding: '14px 16px' } : {}),
      }}
    >
      {/* 1. Date (Prominent Signature) */}
      <div className="event-row-date">
        <span className="event-row-date-day">{dateShort.day}</span>
        <span className="event-row-date-month">{dateShort.month}</span>
      </div>

      {/* 2. Event Info */}
      <div className="event-row-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <h3 className="event-row-title">{event.name}</h3>
          
          {customBadge && customBadge}

          {event.category && (
            <span 
              className="badge badge-subtle" 
              style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}
            >
              {event.category}
            </span>
          )}

          {event.status && event.status !== 'ACTIVE' && (
            <span 
              className={`badge ${
                event.status === 'CONFIRMED' || event.status === 'OPEN' 
                  ? 'badge-open' 
                  : event.status === 'CANCELLED' 
                  ? 'badge-cancelled' 
                  : 'badge-subtle'
              }`}
            >
              {event.status}
            </span>
          )}
        </div>

        {/* Sub-meta */}
        <div className="event-row-meta">
          {event.artist && (
            <span style={{ fontWeight: 500, color: 'var(--ink-primary)' }}>
              {event.artist}
            </span>
          )}
          {event.artist && <span>•</span>}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={13} style={{ color: 'var(--ink-muted)' }} />
            {venueName} · {location}
          </span>
          {event.startTime && (
            <>
              <span>•</span>
              <span className="font-mono" style={{ fontSize: '0.82rem' }}>
                {formatTime(event.startTime)}
              </span>
            </>
          )}
          {bookingDetails?.seatNumbers && (
            <>
              <span>•</span>
              <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                Seats: {bookingDetails.seatNumbers.join(', ')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* 3. Price Display */}
      <div className="event-row-price">
        {priceLabel ? (
          <span className="event-row-price-label">
            {priceLabel}
          </span>
        ) : null}
        <span
          className={validPrice != null || bookingDetails?.totalAmount != null ? "event-row-price-val font-mono" : "font-mono"}
          style={validPrice == null && bookingDetails?.totalAmount == null ? { fontSize: '0.78rem', color: 'var(--ink-muted)' } : {}}
        >
          {priceDisplay}
        </span>
      </div>

      {/* 4. Action Button / Icon */}
      <div className="event-row-actions" onClick={(e) => e.stopPropagation()}>
        {variant === 'booking' ? (
          <Link to={`/my-bookings`} className="btn btn-outline btn-sm">
            View Details
          </Link>
        ) : variant === 'admin' ? (
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => onAction && onAction(event)}
          >
            Manage
          </button>
        ) : (
          <Link
            to={`/events/${event.id}`}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>{actionLabel}</span>
            <ArrowRight size={13} />
          </Link>
        )}
      </div>
    </article>
  );
}

