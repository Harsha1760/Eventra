import { api } from './api';

export const eventService = {
  // Public: GET /api/events
  async getAllEvents() {
    return api.get('/api/events');
  },

  // Public: GET /api/events/{id}
  async getEventById(id) {
    return api.get(`/api/events/${id}`);
  },

  // Public: Filter events by venue ID
  async getEventsByVenue(venueId) {
    const events = await this.getAllEvents();
    if (!venueId) return events;
    return events.filter((evt) => evt.venue && String(evt.venue.id) === String(venueId));
  },

  // Admin: POST /api/events
  async createEvent(eventData) {
    return api.post('/api/events', eventData);
  },

  // Admin: PUT /api/events/{id}
  async updateEvent(id, eventData) {
    return api.put(`/api/events/${id}`, eventData);
  },

  // Admin: DELETE /api/events/{id}
  async deleteEvent(id) {
    return api.delete(`/api/events/${id}`);
  },
};

