import { api } from './api';

export const venueService = {
  // Public: GET /api/venues
  async getAllVenues() {
    return api.get('/api/venues');
  },

  // Public: GET /api/venues/{id}
  async getVenueById(id) {
    return api.get(`/api/venues/${id}`);
  },

  // Admin: POST /api/venues
  async createVenue(venueData) {
    return api.post('/api/venues', venueData);
  },

  // Admin: PUT /api/venues/{id}
  async updateVenue(id, venueData) {
    return api.put(`/api/venues/${id}`, venueData);
  },

  // Admin: DELETE /api/venues/{id}
  async deleteVenue(id) {
    return api.delete(`/api/venues/${id}`);
  },
};

