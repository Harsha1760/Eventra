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

