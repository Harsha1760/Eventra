import { api } from './api';

export const bookingService = {
  // Authenticated: POST /api/bookings -> BookingResponse
  async createBooking({ eventId, seatIds, userId }) {
    return api.post('/api/bookings', {
      eventId: Number(eventId),
      seatIds: seatIds.map((id) => Number(id)),
      ...(userId ? { userId: Number(userId) } : {}),
    });
  },

  // Authenticated: GET /api/bookings/user/{userId}
  async getUserBookings(userId) {
    return api.get(`/api/bookings/user/${userId}`);
  },

  // Admin: GET /api/bookings
  async getAllBookings() {
    return api.get('/api/bookings');
  },

  // Authenticated: PUT /api/bookings/{bookingId}/cancel
  async cancelBooking(bookingId) {
    return api.put(`/api/bookings/${bookingId}/cancel`);
  },

  // Public: GET /api/bookings/seat-check?seatId={seatId}&eventId={eventId}
  async isSeatBooked(seatId, eventId) {
    return api.get(`/api/bookings/seat-check?seatId=${seatId}&eventId=${eventId}`);
  },

  // Helper: batch checks seat availability for an event
  async getBookedSeatIds(seatIds, eventId) {
    if (!seatIds || seatIds.length === 0 || !eventId) return new Set();
    
    const results = await Promise.all(
      seatIds.map(async (seatId) => {
        try {
          const booked = await this.isSeatBooked(seatId, eventId);
          return { seatId, booked: Boolean(booked) };
        } catch {
          return { seatId, booked: false };
        }
      })
    );

    const bookedSet = new Set();
    results.forEach(({ seatId, booked }) => {
      if (booked) bookedSet.add(seatId);
    });
    return bookedSet;
  },
};

