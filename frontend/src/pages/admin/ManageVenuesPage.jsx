import React, { useState, useEffect } from 'react';
import { venueService } from '../../services/venueService';
import { useToast } from '../../hooks/useToast';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export function ManageVenuesPage() {
  const { showToast } = useToast();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');

  const loadVenues = async () => {
    setLoading(true);
    try {
      const data = await venueService.getAllVenues();
      setVenues(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('Error loading venues from backend', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVenues();
  }, []);

  const openCreateModal = () => {
    setEditingVenue(null);
    setName('');
    setLocation('');
    setCapacity('');
    setModalOpen(true);
  };

  const openEditModal = (venue) => {
    setEditingVenue(venue);
    setName(venue.name || '');
    setLocation(venue.location || '');
    setCapacity(venue.capacity ? String(venue.capacity) : '');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    const payload = {
      name,
      location,
      capacity: Number(capacity),
    };

    try {
      if (editingVenue) {
        await venueService.updateVenue(editingVenue.id, payload);
        showToast('Venue updated successfully', 'success');
      } else {
        await venueService.createVenue(payload);
        showToast('Venue created successfully', 'success');
      }
      setModalOpen(false);
      loadVenues();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (venueId) => {
    if (!window.confirm('Delete this venue? Any linked events or seats may restrict deletion.')) {
      return;
    }
    try {
      await venueService.deleteVenue(venueId);
      showToast('Venue deleted successfully', 'success');
      loadVenues();
    } catch (err) {
      showToast(err.message || 'Cannot delete venue referenced by other records', 'error');
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
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Manage Venues</h1>
          <p style={{ color: 'var(--ink-secondary)', marginTop: '4px' }}>
            Auditoriums, amphitheaters, and cultural stages in Hyderabad.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary btn-sm">
          <Plus size={16} />
          <span>New Venue</span>
        </button>
      </div>

      {/* Venues Table */}
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
            Loading venues from backend...
          </div>
        ) : venues.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: 'var(--ink-secondary)', marginBottom: '16px' }}>No venues registered.</p>
            <button onClick={openCreateModal} className="btn btn-primary btn-sm">
              Add First Venue
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>ID</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Venue Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Location</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Capacity</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {venues.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="font-mono" style={{ padding: '14px 16px', color: 'var(--ink-muted)' }}>#{v.id}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--ink-primary)' }}>{v.name}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--ink-secondary)' }}>{v.location}</td>
                    <td className="font-mono" style={{ padding: '14px 16px' }}>{v.capacity} Seats</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button onClick={() => openEditModal(v)} className="btn btn-outline btn-sm" title="Edit Venue">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(v.id)} className="btn btn-danger btn-sm" title="Delete Venue">
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

      {/* Modal */}
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
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem' }}>
                {editingVenue ? 'Edit Venue' : 'Create New Venue'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ color: 'var(--ink-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Venue Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Ravindra Bharathi"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location (Area, City) *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Saifabad, Hyderabad"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Seating Capacity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="form-input"
                  placeholder="e.g. 1100"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="btn btn-primary btn-sm">
                  {formLoading ? 'Saving...' : editingVenue ? 'Save Changes' : 'Create Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

