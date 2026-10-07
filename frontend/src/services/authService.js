import { api } from './api';

/**
 * Normalizes user role to standard uppercase format (e.g. 'Admin' -> 'ADMIN', 'ROLE_ADMIN' -> 'ADMIN', 'User' -> 'USER').
 */
export function normalizeRole(role) {
  if (!role || typeof role !== 'string') return 'USER';
  const clean = role.trim().toUpperCase();
  if (clean === 'ROLE_ADMIN' || clean === 'ADMIN') return 'ADMIN';
  if (clean === 'ROLE_USER' || clean === 'USER') return 'USER';
  return clean;
}

export function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    role: normalizeRole(user.role),
  };
}

export const authService = {
  // Login: POST /api/auth/login -> { token, user: { id, name, email, role } }
  async login(credentials) {
    const response = await api.post('/api/auth/login', credentials);
    if (response && response.user) {
      response.user = normalizeUser(response.user);
    }
    return response;
  },

  // Register: POST /api/users -> { id, name, email, role }
  async register(userData) {
    const response = await api.post('/api/users', userData);
    return normalizeUser(response);
  },
};

