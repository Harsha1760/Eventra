import { api } from './api';

export const userService = {
  // Authenticated (Owner/Admin): GET /api/users/{id}
  async getUserById(id) {
    return api.get(`/api/users/${id}`);
  },

  // Authenticated (Owner/Admin): PUT /api/users/{id}
  async updateUser(id, userData) {
    return api.put(`/api/users/${id}`, userData);
  },

  // Authenticated (Owner/Admin): PUT /api/users/{id}/password
  async changePassword(id, passwordData) {
    return api.put(`/api/users/${id}/password`, passwordData);
  },

  // Authenticated (Owner/Admin): DELETE /api/users/{id}
  async deleteUser(id) {
    return api.delete(`/api/users/${id}`);
  },

  // Admin: GET /api/users
  async getAllUsers() {
    return api.get('/api/users');
  },
};

