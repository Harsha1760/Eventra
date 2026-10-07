import { api } from './api';
import { normalizeUser } from './authService';

export const userService = {
  // Authenticated (Owner/Admin): GET /api/users/{id}
  async getUserById(id) {
    const user = await api.get(`/api/users/${id}`);
    return normalizeUser(user);
  },

  // Authenticated (Owner/Admin): PUT /api/users/{id}
  async updateUser(id, userData) {
    const user = await api.put(`/api/users/${id}`, userData);
    return normalizeUser(user);
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
    const users = await api.get('/api/users');
    return Array.isArray(users) ? users.map(normalizeUser) : users;
  },
};

