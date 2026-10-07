import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { SAMPLE_HYDERABAD_EVENTS } from '../../utils/sampleData';
import { EventRow } from '../../components/events/EventRow';
import { CATEGORIES } from '../../utils/constants';
import { Search, RefreshCw } from 'lucide-react';

export function EventsPage() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('date-asc'); // date-asc, name-asc, price-asc
  const [maxPrice, setMaxPrice] = useState(3000);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.getAllEvents();
      if (Array.isArray(data) && data.length > 0) {
        setEvents(data);
      } else {
        // API succeeded, but database contains no records -> preview curated sample
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
    fetchEvents();
  }, []);

  // Filter & Sorting Computation
  const filteredEvents = events
    .filter((evt) => {
      const matchSearch =
        evt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (evt.artist && evt.artist.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (evt.venue?.name && evt.venue.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        selectedCategory === 'All' ||
        (evt.category && evt.category.toLowerCase().includes(selectedCategory.toLowerCase()));

      const eventPrice = evt.price || 999;
      const matchPrice = eventPrice <= maxPrice;

      return matchSearch && matchCategory && matchPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'date-asc') {
        return new Date(a.eventDate || 0) - new Date(b.eventDate || 0);
      }
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'price-asc') {
        return (a.price || 999) - (b.price || 999);
      }
      return 0;
    });

  return (
    <div style={{ padding: '48px 0 80px 0' }}>
      <div className="container">
        {/* Page Header */}
        <div 
          style={{ 
            borderBottom: '2px solid var(--ink-primary)', 
            paddingBottom: '24px', 
            marginBottom: '36px',
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
                marginBottom: '8px',
              }}
            >
              CULTURAL CALENDAR · HYDERABAD
            </div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', margin: 0 }}>
              Discover Live Events
            </h1>
          </div>

          <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
            Showing {filteredEvents.length} Performances
          </div>
        </div>

        {/* Restrained Filter Bar */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            padding: '20px',
            marginBottom: '36px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Keyword Search */}
          <div style={{ position: 'relative' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '4px' }}>Search</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--ink-muted)' }} />
              <input
                type="text"
                placeholder="Title, artist, venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '32px' }}
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '4px' }}>Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Option */}
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '4px' }}>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
            >
              <option value="date-asc">Date: Upcoming First</option>
              <option value="name-asc">Title: Alphabetical</option>
              <option value="price-asc">Price: Low to High</option>
            </select>
          </div>

          {/* Reset Action */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSortBy('date-asc');
              }}
              className="btn btn-outline"
              style={{ width: '100%', height: '42px' }}
            >
              <RefreshCw size={13} />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Event List Container */}
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
              Loading performances from Eventra API...
            </div>
          ) : error ? (
            <div style={{ padding: '64px 24px', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '8px', color: 'var(--accent)' }}>Connection Error</h3>
              <p style={{ color: 'var(--ink-secondary)', marginBottom: '8px' }}>
                {error}
              </p>
              <p style={{ color: 'var(--ink-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                Please check that the Spring Boot backend is active on port 4040.
              </p>
              <button
                onClick={fetchEvents}
                className="btn btn-outline btn-sm"
              >
                <RefreshCw size={13} />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ padding: '64px 24px', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '8px' }}>No events found</h3>
              <p style={{ color: 'var(--ink-secondary)', marginBottom: '20px' }}>
                We couldn't find any events matching your selected criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="btn btn-outline btn-sm"
              >
                Clear all filters
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
    </div>
  );
}

