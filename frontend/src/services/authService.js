import { api } from './api';

export const authService = {
  // Login: POST /api/auth/login -> { token, user: { id, name, email, role } }
  async login(credentials) {
    return api.post('/api/auth/login', credentials);
  },

  // Register: POST /api/users -> { id, name, email, role }
  async register(userData) {
    return api.post('/api/users', userData);
  },
};

