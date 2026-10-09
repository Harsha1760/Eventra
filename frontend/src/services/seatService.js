import { api } from './api';

export const seatService = {
  // Public: GET /api/seats
  async getAllSeats() {
    return api.get('/api/seats');
  },

  // Helper: Filter seats by Venue ID
  async getSeatsByVenue(venueId) {
    const seats = await api.get('/api/seats');
    if (!venueId) return seats || [];
    return (seats || []).filter(
      (seat) => seat.venue && String(seat.venue.id) === String(venueId)
    );
  },

  // Helper: map venueId -> minimum valid seat price
  async getVenuePriceMap() {
    try {
      const seats = await this.getAllSeats();
      if (!Array.isArray(seats)) return new Map();
      const map = new Map();
      for (const seat of seats) {
        if (!seat || seat.price == null || seat.venue?.id == null) continue;
        const numPrice = Number(seat.price);
        if (!isNaN(numPrice) && numPrice > 0) {
          const vId = String(seat.venue.id);
          const currentMin = map.get(vId);
          if (currentMin === undefined || numPrice < currentMin) {
            map.set(vId, numPrice);
          }
        }
      }
      return map;
    } catch {
      return new Map();
    }
  },

  // Public: GET /api/seats/{id}
  async getSeatById(id) {
    return api.get(`/api/seats/${id}`);
  },

  // Admin: POST /api/seats
  async createSeat(seatData) {
    return api.post('/api/seats', seatData);
  },

  // Admin: POST /api/seats/bulk
  async createSeatsBulk(bulkData) {
    return api.post('/api/seats/bulk', bulkData);
  },

  // Admin: PUT /api/seats/{id}
  async updateSeat(id, seatData) {
    return api.put(`/api/seats/${id}`, seatData);
  },

  // Admin: DELETE /api/seats/{id}
  async deleteSeat(id) {
    return api.delete(`/api/seats/${id}`);
  },
};

/**
 * Derives dynamic seat price tiers from an array of Seat records.
 * Groups seats by category/section/seatType and price.
 */
export function deriveSeatTiers(seats = []) {
  if (!Array.isArray(seats) || seats.length === 0) {
    return [];
  }

  // Filter seats with valid positive price
  const validSeats = seats.filter(
    (s) => s != null && s.price != null && !isNaN(Number(s.price)) && Number(s.price) > 0
  );

  if (validSeats.length === 0) {
    return [];
  }

  // Group by (tierName + price)
  const tiersMap = new Map();

  for (const seat of validSeats) {
    const tierName = seat.seatType || seat.section || 'General Admission';
    const sectionName = seat.section || seat.seatType || '';
    const price = Number(seat.price);
    const key = `${tierName.trim().toUpperCase()}__${price}`;

    if (!tiersMap.has(key)) {
      tiersMap.set(key, {
        name: tierName.trim(),
        section: sectionName.trim(),
        price: price,
        seatCount: 0,
        rows: new Set(),
      });
    }

    const tier = tiersMap.get(key);
    tier.seatCount += 1;
    if (seat.seatNumber) {
      const match = seat.seatNumber.match(/^[A-Za-z]+/);
      if (match) {
        tier.rows.add(match[0].toUpperCase());
      }
    }
  }

  const tiers = Array.from(tiersMap.values()).map((t) => {
    const sortedRows = Array.from(t.rows).sort();
    let rowInfo = '';
    if (sortedRows.length === 1) {
      rowInfo = `Row ${sortedRows[0]}`;
    } else if (sortedRows.length > 1) {
      rowInfo = `Rows ${sortedRows[0]}–${sortedRows[sortedRows.length - 1]}`;
    }

    const noteParts = [];
    if (t.section && t.section.toLowerCase() !== t.name.toLowerCase()) {
      noteParts.push(`Section: ${t.section}`);
    }
    if (rowInfo) {
      noteParts.push(rowInfo);
    }
    noteParts.push(`${t.seatCount} ${t.seatCount === 1 ? 'seat' : 'seats'}`);

    return {
      name: t.name,
      section: t.section,
      price: t.price,
      status: 'Available',
      note: noteParts.join(' · '),
      seatCount: t.seatCount,
    };
  });

  // Sort descending by price so premier tiers appear first
  return tiers.sort((a, b) => b.price - a.price);
}

