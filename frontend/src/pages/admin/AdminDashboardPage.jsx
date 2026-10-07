import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { venueService } from '../../services/venueService';
import { seatService } from '../../services/seatService';
import { bookingService } from '../../services/bookingService';
import { userService } from '../../services/userService';
import { Calendar, MapPin, Grid, Ticket, Users, ArrowRight } from 'lucide-react';

export function AdminDashboardPage() {
  const [counts, setCounts] = useState({
    events: 0,
    venues: 0,
    seats: 0,
    bookings: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [events, venues, seats, bookings, users] = await Promise.allSettled([
          eventService.getAllEvents(),
          venueService.getAllVenues(),
          seatService.getAllSeats(),
          bookingService.getAllBookings(),
          userService.getAllUsers(),
        ]);

        setCounts({
          events: events.status === 'fulfilled' && Array.isArray(events.value) ? events.value.length : 0,
          venues: venues.status === 'fulfilled' && Array.isArray(venues.value) ? venues.value.length : 0,
          seats: seats.status === 'fulfilled' && Array.isArray(seats.value) ? seats.value.length : 0,
          bookings: bookings.status === 'fulfilled' && Array.isArray(bookings.value) ? bookings.value.length : 0,
          users: users.status === 'fulfilled' && Array.isArray(users.value) ? users.value.length : 0,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchCounts();
  }, []);

  const adminCards = [
    { title: 'Live Events', count: counts.events, path: '/admin/events', icon: Calendar, desc: 'Schedule and manage performances' },
    { title: 'Active Venues', count: counts.venues, path: '/admin/venues', icon: MapPin, desc: 'Hyderabad locations and capacities' },
    { title: 'Seat Layouts', count: counts.seats, path: '/admin/seats', icon: Grid, desc: 'Pricing zones and seat matrices' },
    { title: 'Total Bookings', count: counts.bookings, path: '/admin/bookings', icon: Ticket, desc: 'Master ticket transaction log' },
    { title: 'Registered Users', count: counts.users, path: '/admin/users', icon: Users, desc: 'Platform attendee accounts' },
  ];

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ borderBottom: '2px solid var(--ink-primary)', paddingBottom: '16px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.4rem', margin: 0 }}>System Management</h1>
        <p style={{ color: 'var(--ink-secondary)', marginTop: '6px' }}>
          Real-time operations connected to Spring Boot REST backend on port 4040.
        </p>
      </div>

      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}
      >
        {adminCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink-primary)' }}>
                    {card.title}
                  </span>
                  <Icon size={18} style={{ color: 'var(--accent)' }} />
                </div>

                <div className="font-mono" style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--ink-primary)', lineHeight: 1, marginBottom: '10px' }}>
                  {loading ? '--' : card.count}
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)', lineHeight: 1.4 }}>
                  {card.desc}
                </p>
              </div>

              <div style={{ marginTop: '24px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                <Link
                  to={card.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--accent)',
                  }}
                >
                  <span>Open Management</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

