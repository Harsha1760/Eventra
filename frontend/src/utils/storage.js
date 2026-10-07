const TOKEN_KEY = 'eventra_auth_token';
const USER_KEY = 'eventra_auth_user';

export const storage = {
  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token) {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      console.error('Failed to save token to localStorage', e);
    }
  },

  removeToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('Failed to remove token', e);
    }
  },

  getUser() {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setUser(user) {
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch (e) {
      console.error('Failed to save user to localStorage', e);
    }
  },

  removeUser() {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Failed to remove user', e);
    }
  },

  clearAuth() {
    this.removeToken();
    this.removeUser();
  },
};

