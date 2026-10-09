import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { venueService } from '../../services/venueService';
import { seatService } from '../../services/seatService';
import { SAMPLE_HYDERABAD_EVENTS } from '../../utils/sampleData';
import { EventRow } from '../../components/events/EventRow';
import { CATEGORIES } from '../../utils/constants';
import { Search, RefreshCw, MapPin, X } from 'lucide-react';

export function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const routeParams = useParams();
  const navigate = useNavigate();

  const venueIdFromUrl = routeParams.id || searchParams.get('venueId') || searchParams.get('venue') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [events, setEvents] = useState([]);
  const [venuesList, setVenuesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedVenueId, setSelectedVenueId] = useState(venueIdFromUrl);
  const [sortBy, setSortBy] = useState('date-asc'); // date-asc, name-asc, price-asc
  const [maxPrice, _setMaxPrice] = useState(3000);

  // Sync filters if URL search params or route params change externally
  useEffect(() => {
    const vId = routeParams.id || searchParams.get('venueId') || searchParams.get('venue') || '';
    setSelectedVenueId(vId);
    if (searchParams.has('category')) {
      setSelectedCategory(searchParams.get('category') || 'All');
    }
    if (searchParams.has('search')) {
      setSearchQuery(searchParams.get('search') || '');
    }
  }, [searchParams, routeParams.id]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, venuePrices] = await Promise.all([
        eventService.getAllEvents(),
        seatService.getVenuePriceMap(),
      ]);
      if (Array.isArray(data) && data.length > 0) {
        const enriched = data.map((evt) => {
          const venueMinPrice = evt.venue?.id ? venuePrices.get(String(evt.venue.id)) : null;
          return {
            ...evt,
            startingPrice: venueMinPrice ?? (typeof evt.price === 'number' && evt.price > 0 ? evt.price : null),
          };
        });
        setEvents(enriched);
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

  const fetchVenues = async () => {
    try {
      const data = await venueService.getAllVenues();
      if (Array.isArray(data) && data.length > 0) {
        setVenuesList(data);
      }
    } catch {
      // Non-blocking: venues can still be inferred from loaded events
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchVenues();
  }, []);

  // Resolve active venue details if filtered
  const currentVenue = selectedVenueId
    ? venuesList.find((v) => String(v.id) === String(selectedVenueId)) ||
      events.find((e) => String(e.venue?.id) === String(selectedVenueId))?.venue ||
      null
    : null;

  // Available venues for dropdown
  const availableVenues = venuesList.length > 0
    ? venuesList
    : Array.from(
        new Map(
          events
            .filter((e) => e.venue?.id)
            .map((e) => [String(e.venue.id), e.venue])
        ).values()
      );

  const handleVenueChange = (newVenueId) => {
    setSelectedVenueId(newVenueId);
    const nextParams = new URLSearchParams(searchParams);
    if (newVenueId) {
      nextParams.set('venueId', newVenueId);
    } else {
      nextParams.delete('venueId');
      nextParams.delete('venue');
    }
    setSearchParams(nextParams, { replace: true });
    if (routeParams.id) {
      navigate(newVenueId ? `/events?venueId=${newVenueId}` : '/events');
    }
  };

  const clearVenueFilter = () => {
    setSelectedVenueId('');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('venueId');
    nextParams.delete('venue');
    setSearchParams(nextParams, { replace: true });
    if (routeParams.id) {
      navigate('/events');
    }
  };

  // Filter & Sorting Computation
  const filteredEvents = events
    .filter((evt) => {
      // 1. Strict venue filtering by database ID
      if (selectedVenueId) {
        if (!evt.venue || String(evt.venue.id) !== String(selectedVenueId)) {
          return false;
        }
      }

      // 2. Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = evt.name?.toLowerCase().includes(q);
        const matchArtist = evt.artist && evt.artist.toLowerCase().includes(q);
        const matchVenue = evt.venue?.name && evt.venue.name.toLowerCase().includes(q);
        if (!matchName && !matchArtist && !matchVenue) {
          return false;
        }
      }

      // 3. Category
      if (selectedCategory !== 'All') {
        if (!evt.category || !evt.category.toLowerCase().includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      // 4. Price
      const eventPrice = evt.startingPrice ?? (typeof evt.price === 'number' && evt.price > 0 ? evt.price : null);
      if (eventPrice != null && eventPrice > maxPrice) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date-asc') {
        return new Date(a.eventDate || 0) - new Date(b.eventDate || 0);
      }
      if (sortBy === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'price-asc') {
        const priceA = a.startingPrice ?? (typeof a.price === 'number' && a.price > 0 ? a.price : Infinity);
        const priceB = b.startingPrice ?? (typeof b.price === 'number' && b.price > 0 ? b.price : Infinity);
        return priceA - priceB;
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
              {selectedVenueId
                ? `SPATIAL HERITAGE · ${currentVenue?.name ? currentVenue.name.toUpperCase() : `VENUE #${selectedVenueId}`}`
                : 'CULTURAL CALENDAR · HYDERABAD'}
            </div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', margin: 0 }}>
              {selectedVenueId && currentVenue ? currentVenue.name : 'Discover Live Events'}
            </h1>
            {selectedVenueId && currentVenue?.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ink-secondary)', marginTop: '8px', fontSize: '0.95rem' }}>
                <MapPin size={15} style={{ color: 'var(--accent)' }} />
                <span>{currentVenue.location}</span>
                {currentVenue.capacity && (
                  <span className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginLeft: '6px' }}>
                    · {currentVenue.capacity} Capacity
                  </span>
                )}
              </div>
            )}
            {selectedVenueId && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                <span
                  className="badge badge-accent"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', fontSize: '0.78rem' }}
                >
                  <span>Filtered by Venue: {currentVenue?.name || `#${selectedVenueId}`}</span>
                  <button
                    onClick={clearVenueFilter}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      color: 'inherit',
                    }}
                    title="Clear venue filter"
                  >
                    <X size={13} />
                  </button>
                </span>
                <button
                  onClick={clearVenueFilter}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                >
                  View All Venues
                </button>
              </div>
            )}
          </div>

          <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
            Showing {filteredEvents.length} Performances
          </div>
        </div>

        {/* Restrained Filter Bar */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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

          {/* Venue Dropdown */}
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '4px' }}>Venue</label>
            <select
              value={selectedVenueId}
              onChange={(e) => handleVenueChange(e.target.value)}
              className="form-select"
            >
              <option value="">All Venues</option>
              {availableVenues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
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
                clearVenueFilter();
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
              <h3 style={{ marginBottom: '8px' }}>
                {selectedVenueId ? 'No events scheduled at this venue' : 'No events found'}
              </h3>
              <p style={{ color: 'var(--ink-secondary)', marginBottom: '20px' }}>
                {selectedVenueId
                  ? `There are currently no scheduled performances at ${currentVenue?.name || 'this venue'}.`
                  : "We couldn't find any events matching your selected criteria."}
              </p>
              <button
                onClick={() => {
                  if (selectedVenueId) {
                    clearVenueFilter();
                  } else {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }
                }}
                className="btn btn-outline btn-sm"
              >
                {selectedVenueId ? 'View all events across Hyderabad' : 'Clear all filters'}
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

