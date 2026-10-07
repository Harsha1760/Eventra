import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import { useToast } from '../../hooks/useToast';
import { formatDateFull, formatCurrency, formatBookingRef } from '../../utils/formatters';
import { Ticket, Search } from 'lucide-react';

export function ManageBookingsPage() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getAllBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('Error loading master bookings list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesSearch =
      (b.userName && b.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.eventName && b.eventName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      String(b.bookingId).includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ textAlign: 'left' }}>
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid var(--ink-primary)',
          paddingBottom: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>All Bookings</h1>
          <p style={{ color: 'var(--ink-secondary)', marginTop: '4px' }}>
            Master transaction and reservation history across all attendees.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search attendee, event, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ width: '220px' }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div 
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
            Loading bookings from backend...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: 'var(--ink-secondary)' }}>No booking transactions found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Ref #</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Attendee</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Performance</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Seats</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Booking Date</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Total</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b.bookingId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="font-mono" style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--ink-muted)' }}>
                      {formatBookingRef(b.bookingId)}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--ink-primary)' }}>
                      {b.userName || `User #${b.userId}`}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--ink-primary)' }}>
                      {b.eventName || 'Live Performance'}
                    </td>
                    <td className="font-mono" style={{ padding: '14px 16px', color: 'var(--accent)', fontWeight: 600 }}>
                      {b.seatNumbers?.join(', ') || '—'}
                    </td>
                    <td className="font-mono" style={{ padding: '14px 16px', fontSize: '0.82rem' }}>
                      {formatDateFull(b.bookingDate)}
                    </td>
                    <td className="font-mono" style={{ padding: '14px 16px', fontWeight: 600 }}>
                      {formatCurrency(b.totalAmount)}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-open' : 'badge-cancelled'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

