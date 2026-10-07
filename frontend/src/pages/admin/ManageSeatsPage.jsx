import React, { useState, useEffect } from 'react';
import { seatService } from '../../services/seatService';
import { venueService } from '../../services/venueService';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export function ManageSeatsPage() {
  const { showToast } = useToast();
  const [seats, setSeats] = useState([]);
  const [venues, setVenues] = useState([]);
  const [selectedVenueFilter, setSelectedVenueFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSeat, setEditingSeat] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [seatNumber, setSeatNumber] = useState('');
  const [section, setSection] = useState('VIP');
  const [seatType, setSeatType] = useState('Reserved');
  const [price, setPrice] = useState('999');
  const [venueId, setVenueId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [seatsData, venuesData] = await Promise.all([
        seatService.getAllSeats(),
        venueService.getAllVenues(),
      ]);
      setSeats(Array.isArray(seatsData) ? seatsData : []);
      setVenues(Array.isArray(venuesData) ? venuesData : []);
      if (venuesData?.length > 0 && !venueId) {
        setVenueId(String(venuesData[0].id));
      }
    } catch (err) {
      showToast('Error loading seat inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingSeat(null);
    setSeatNumber('');
    setSection('VIP');
    setSeatType('Standard Orchestra');
    setPrice('999');
    setVenueId(venues[0]?.id ? String(venues[0].id) : '');
    setModalOpen(true);
  };

  const openEditModal = (seat) => {
    setEditingSeat(seat);
    setSeatNumber(seat.seatNumber || '');
    setSection(seat.section || 'Standard');
    setSeatType(seat.seatType || 'General');
    setPrice(seat.price ? String(seat.price) : '999');
    setVenueId(seat.venue?.id ? String(seat.venue.id) : '');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!venueId) {
      showToast('Please select a venue for this seat', 'error');
      return;
    }

    setFormLoading(true);

    const payload = {
      seatNumber,
      section,
      seatType,
      price: Number(price),
      venue: { id: Number(venueId) },
    };

    try {
      if (editingSeat) {
        await seatService.updateSeat(editingSeat.id, payload);
        showToast('Seat updated successfully', 'success');
      } else {
        await seatService.createSeat(payload);
        showToast('Seat created successfully', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (seatId) => {
    if (!window.confirm('Delete this seat record?')) return;
    try {
      await seatService.deleteSeat(seatId);
      showToast('Seat deleted successfully', 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Cannot delete seat referenced by existing bookings', 'error');
    }
  };

  const filteredSeats = seats.filter((s) => {
    if (selectedVenueFilter === 'ALL') return true;
    return s.venue?.id && String(s.venue.id) === String(selectedVenueFilter);
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
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Manage Seats & Tiers</h1>
          <p style={{ color: 'var(--ink-secondary)', marginTop: '4px' }}>
            Venue seat assignments and pricing tiers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Venue filter */}
          <select
            value={selectedVenueFilter}
            onChange={(e) => setSelectedVenueFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <option value="ALL">All Venues</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          <button onClick={openCreateModal} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>New Seat</span>
          </button>
        </div>
      </div>

      {/* Seats Table */}
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
            Loading seat records...
          </div>
        ) : filteredSeats.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: 'var(--ink-secondary)', marginBottom: '16px' }}>
              No seats found for selected venue.
            </p>
            <button onClick={openCreateModal} className="btn btn-primary btn-sm">
              Create Seat
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Seat #</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Section / Zone</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Price</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Venue</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSeats.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="font-mono" style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--accent)' }}>
                      {s.seatNumber}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 500 }}>{s.section}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--ink-secondary)' }}>{s.seatType || 'Standard'}</td>
                    <td className="font-mono" style={{ padding: '14px 16px', fontWeight: 600 }}>
                      {formatCurrency(s.price)}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--ink-secondary)' }}>
                      {s.venue?.name || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button onClick={() => openEditModal(s)} className="btn btn-outline btn-sm" title="Edit Seat">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="btn btn-danger btn-sm" title="Delete Seat">
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
                {editingSeat ? 'Edit Seat' : 'Create Seat Unit'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ color: 'var(--ink-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Seat Number * (e.g. A1, B4, C12)</label>
                <input
                  type="text"
                  required
                  value={seatNumber}
                  onChange={(e) => setSeatNumber(e.target.value)}
                  className="form-input"
                  placeholder="e.g. A1"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Section / Tier *</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="form-select"
                  >
                    <option value="VIP">VIP</option>
                    <option value="Premium">Premium</option>
                    <option value="Standard">Standard</option>
                    <option value="Balcony">Balcony</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price (INR) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="50"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Seat Type Description</label>
                <input
                  type="text"
                  value={seatType}
                  onChange={(e) => setSeatType(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Front Row Center"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Venue *</label>
                <select
                  required
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select venue...</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="btn btn-primary btn-sm">
                  {formLoading ? 'Saving...' : editingSeat ? 'Save Changes' : 'Create Seat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

