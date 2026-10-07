import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/eventService';
import { venueService } from '../../services/venueService';
import { useToast } from '../../hooks/useToast';
import { formatDateFull, formatTime } from '../../utils/formatters';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export function ManageEventsPage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [artist, setArtist] = useState('');
  const [category, setCategory] = useState('Music');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venueId, setVenueId] = useState('');
  const [status, setStatus] = useState('OPEN');

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsData, venuesData] = await Promise.all([
        eventService.getAllEvents(),
        venueService.getAllVenues(),
      ]);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setVenues(Array.isArray(venuesData) ? venuesData : []);
    } catch (err) {
      showToast('Error loading events from backend', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingEvent(null);
    setName('');
    setDescription('');
    setArtist('');
    setCategory('Music & Concerts');
    setEventDate('');
    setStartTime('19:00:00');
    setEndTime('21:30:00');
    setVenueId(venues[0]?.id ? String(venues[0].id) : '');
    setStatus('OPEN');
    setModalOpen(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setName(event.name || '');
    setDescription(event.description || '');
    setArtist(event.artist || '');
    setCategory(event.category || 'Music & Concerts');
    setEventDate(event.eventDate || '');
    setStartTime(event.startTime || '19:00:00');
    setEndTime(event.endTime || '21:30:00');
    setVenueId(event.venue?.id ? String(event.venue.id) : '');
    setStatus(event.status || 'OPEN');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!venueId) {
      showToast('Please select or create a venue first', 'error');
      return;
    }

    setFormLoading(true);

    const payload = {
      name,
      description,
      artist,
      category,
      eventDate,
      startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
      endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
      status,
      venue: { id: Number(venueId) },
    };

    try {
      if (editingEvent) {
        await eventService.updateEvent(editingEvent.id, payload);
        showToast('Event updated successfully', 'success');
      } else {
        await eventService.createEvent(payload);
        showToast('Event created successfully', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Delete this event? Note: Events with existing bookings cannot be deleted.')) {
      return;
    }
    try {
      await eventService.deleteEvent(eventId);
      showToast('Event deleted successfully', 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Cannot delete event with booking history', 'error');
    }
  };

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
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Manage Events</h1>
          <p style={{ color: 'var(--ink-secondary)', marginTop: '4px' }}>
            Spring Boot Event CRUD operations.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary btn-sm">
          <Plus size={16} />
          <span>New Event</span>
        </button>
      </div>

      {/* Events Table */}
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
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: 'var(--ink-secondary)', marginBottom: '16px' }}>No events in database.</p>
            <button onClick={openCreateModal} className="btn btn-primary btn-sm">
              Create First Event
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>ID</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Event Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Artist</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date & Time</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Venue</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((evt) => (
                  <tr key={evt.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="font-mono" style={{ padding: '14px 16px', color: 'var(--ink-muted)' }}>#{evt.id}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--ink-primary)' }}>{evt.name}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--ink-secondary)' }}>{evt.artist || '—'}</td>
                    <td className="font-mono" style={{ padding: '14px 16px', fontSize: '0.82rem' }}>
                      {formatDateFull(evt.eventDate)} {evt.startTime ? `· ${formatTime(evt.startTime)}` : ''}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--ink-secondary)' }}>{evt.venue?.name || '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${evt.status === 'OPEN' ? 'badge-open' : 'badge-subtle'}`}>
                        {evt.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button onClick={() => openEditModal(evt)} className="btn btn-outline btn-sm" title="Edit Event">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(evt.id)} className="btn btn-danger btn-sm" title="Delete Event">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
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
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem' }}>
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ color: 'var(--ink-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Event Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Hyderabad Jazz Nights"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  placeholder="Event synopsis..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Artist / Ensemble</label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Zakir Hussain"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-input"
                    placeholder="Music, Comedy, etc."
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Date (YYYY-MM-DD) *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    step="1"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    step="1"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Venue *</label>
                  <select
                    required
                    value={venueId}
                    onChange={(e) => setVenueId(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select a venue...</option>
                    {venues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="form-select"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="btn btn-primary btn-sm">
                  {formLoading ? 'Saving...' : editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

