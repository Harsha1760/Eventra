import React, { useState, useEffect } from 'react';
import { seatService } from '../../services/seatService';
import { venueService } from '../../services/venueService';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Edit2, Trash2, X, Layers, AlertCircle } from 'lucide-react';

export function ManageSeatsPage() {
  const { showToast } = useToast();
  const [seats, setSeats] = useState([]);
  const [venues, setVenues] = useState([]);
  const [selectedVenueFilter, setSelectedVenueFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Single-Seat Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSeat, setEditingSeat] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Single-Seat Form Fields
  const [seatNumber, setSeatNumber] = useState('');
  const [section, setSection] = useState('VIP');
  const [seatType, setSeatType] = useState('Reserved');
  const [price, setPrice] = useState('999');
  const [venueId, setVenueId] = useState('');

  // Bulk Create Modal State
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkVenueId, setBulkVenueId] = useState('');
  const [bulkCategory, setBulkCategory] = useState('PREMIUM');
  const [bulkRowFrom, setBulkRowFrom] = useState('A');
  const [bulkRowTo, setBulkRowTo] = useState('C');
  const [bulkSeatsPerRow, setBulkSeatsPerRow] = useState('10');
  const [bulkPrice, setBulkPrice] = useState('750');
  const [bulkError, setBulkError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [seatsData, venuesData] = await Promise.all([
        seatService.getAllSeats(),
        venueService.getAllVenues(),
      ]);
      setSeats(Array.isArray(seatsData) ? seatsData : []);
      setVenues(Array.isArray(venuesData) ? venuesData : []);
      if (venuesData?.length > 0) {
        if (!venueId) setVenueId(String(venuesData[0].id));
        if (!bulkVenueId) setBulkVenueId(String(venuesData[0].id));
      }
    } catch (_err) {
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

  const openBulkModal = () => {
    setBulkError(null);
    setBulkCategory('PREMIUM');
    setBulkRowFrom('A');
    setBulkRowTo('C');
    setBulkSeatsPerRow('10');
    setBulkPrice('750');
    setBulkVenueId(venues[0]?.id ? String(venues[0].id) : '');
    setBulkModalOpen(true);
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

  // Live Bulk Preview Calculations
  const cleanFrom = (bulkRowFrom || '').trim().toUpperCase();
  const cleanTo = (bulkRowTo || '').trim().toUpperCase();
  const seatsPerNum = parseInt(bulkSeatsPerRow, 10) || 0;
  const priceNum = parseFloat(bulkPrice) || 0;

  const isValidRowRange =
    cleanFrom.length === 1 &&
    cleanTo.length === 1 &&
    cleanFrom >= 'A' &&
    cleanFrom <= 'Z' &&
    cleanTo >= 'A' &&
    cleanTo <= 'Z' &&
    cleanFrom.charCodeAt(0) <= cleanTo.charCodeAt(0);

  const rowCount = isValidRowRange
    ? cleanTo.charCodeAt(0) - cleanFrom.charCodeAt(0) + 1
    : 0;
  const totalBulkSeats = rowCount * Math.max(0, seatsPerNum);

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setBulkError(null);

    if (!bulkVenueId) {
      setBulkError('Please select a venue.');
      return;
    }
    if (!isValidRowRange) {
      setBulkError('Row range must be valid letters from A to Z where Row From <= Row To.');
      return;
    }
    if (seatsPerNum <= 0) {
      setBulkError('Seats per row must be greater than zero.');
      return;
    }
    if (priceNum <= 0) {
      setBulkError('Price per seat must be greater than zero.');
      return;
    }

    setBulkLoading(true);
    const payload = {
      venueId: Number(bulkVenueId),
      category: bulkCategory.trim(),
      rowFrom: cleanFrom,
      rowTo: cleanTo,
      seatsPerRow: seatsPerNum,
      price: priceNum,
    };

    try {
      const created = await seatService.createSeatsBulk(payload);
      const count = Array.isArray(created) ? created.length : totalBulkSeats;
      showToast(`Successfully generated ${count} seats in bulk!`, 'success');
      setBulkModalOpen(false);
      loadData();
    } catch (err) {
      const msg = err.message || 'Bulk creation failed';
      setBulkError(msg);
      showToast(msg, 'error');
    } finally {
      setBulkLoading(false);
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
            Venue seat assignments, tiered matrices, and bulk generation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
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

          {/* Bulk Generation CTA */}
          <button onClick={openBulkModal} className="btn btn-secondary btn-sm" title="Generate rows of seats in batch">
            <Layers size={15} style={{ color: 'var(--accent)' }} />
            <span>Bulk Create Seats</span>
          </button>

          {/* Single Seat CTA */}
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

      {/* Bulk Create Modal */}
      {bulkModalOpen && (
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
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--accent-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                  }}
                >
                  <Layers size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.3rem' }}>
                  Bulk Create Seats
                </h3>
              </div>
              <button
                onClick={() => setBulkModalOpen(false)}
                style={{ color: 'var(--ink-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)', marginBottom: '20px' }}>
              Generate complete rows of tiered seats for a venue in a single all-or-nothing batch.
            </p>

            {bulkError && (
              <div
                style={{
                  backgroundColor: 'var(--status-cancel-bg)',
                  border: '1px solid var(--status-cancel-border)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--status-cancel-text)',
                  fontSize: '0.86rem',
                  marginBottom: '18px',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{bulkError}</span>
              </div>
            )}

            <form onSubmit={handleBulkSubmit}>
              <div className="form-group">
                <label className="form-label">Venue *</label>
                <select
                  required
                  value={bulkVenueId}
                  onChange={(e) => setBulkVenueId(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select target venue...</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.location})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Category / Tier *</label>
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="form-select"
                  >
                    <option value="PREMIUM">PREMIUM</option>
                    <option value="VIP">VIP</option>
                    <option value="STANDARD">STANDARD</option>
                    <option value="BALCONY">BALCONY</option>
                    <option value="EXECUTIVE">EXECUTIVE</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price per Seat (INR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                    className="form-input"
                    placeholder="750"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Row From *</label>
                  <input
                    type="text"
                    required
                    maxLength={1}
                    value={bulkRowFrom}
                    onChange={(e) => setBulkRowFrom(e.target.value.toUpperCase())}
                    className="form-input font-mono"
                    placeholder="A"
                    style={{ textAlign: 'center', textTransform: 'uppercase' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Row To *</label>
                  <input
                    type="text"
                    required
                    maxLength={1}
                    value={bulkRowTo}
                    onChange={(e) => setBulkRowTo(e.target.value.toUpperCase())}
                    className="form-input font-mono"
                    placeholder="C"
                    style={{ textAlign: 'center', textTransform: 'uppercase' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Seats / Row *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={bulkSeatsPerRow}
                    onChange={(e) => setBulkSeatsPerRow(e.target.value)}
                    className="form-input font-mono"
                    placeholder="10"
                    style={{ textAlign: 'center' }}
                  />
                </div>
              </div>

              {/* Live Preview / Count Card */}
              <div
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '14px 16px',
                  marginTop: '6px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="font-mono" style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-muted)' }}>
                    Batch Preview
                  </span>
                  {isValidRowRange && (
                    <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--ink-secondary)' }}>
                      Rows {cleanFrom} through {cleanTo} ({rowCount} {rowCount === 1 ? 'row' : 'rows'})
                    </span>
                  )}
                </div>

                {isValidRowRange && totalBulkSeats > 0 ? (
                  <div style={{ fontSize: '0.92rem', color: 'var(--ink-primary)', fontWeight: 500 }}>
                    This will create <strong style={{ color: 'var(--accent)' }}>{totalBulkSeats}</strong> {bulkCategory} seats at <strong className="font-mono">{formatCurrency(priceNum)}</strong> each.
                    <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: '4px' }}>
                      Range: <span className="font-mono">{cleanFrom}1–{cleanFrom}{seatsPerNum}</span> ... <span className="font-mono">{cleanTo}1–{cleanTo}{seatsPerNum}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.84rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                    Enter valid row letters (A–Z) and positive seat count to preview batch.
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  className="btn btn-outline btn-sm"
                  disabled={bulkLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkLoading || !isValidRowRange || totalBulkSeats <= 0}
                  className="btn btn-primary btn-sm"
                >
                  {bulkLoading ? 'Generating Seats...' : `Generate ${totalBulkSeats > 0 ? `${totalBulkSeats} ` : ''}Seats`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

