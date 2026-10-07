import { API_BASE_URL } from '../utils/constants';
import { storage } from '../utils/storage';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = storage.getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (_netErr) {
    throw new ApiError('Unable to connect to Eventra server. Please ensure the backend is running.', 0, null);
  }

  // Handle No Content
  if (response.status === 204) {
    return null;
  }

  // Parse response
  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let errorMessage = 'An unexpected error occurred';
    if (typeof data === 'object' && data !== null) {
      errorMessage = data.message || data.error || errorMessage;
    } else if (typeof data === 'string' && data.length > 0) {
      errorMessage = data;
    }

    if (response.status === 401) {
      // Trigger token cleanup if unauthorized
      window.dispatchEvent(new CustomEvent('eventra:unauthorized'));
    }

    throw new ApiError(errorMessage, response.status, data);
  }

  return data;
}

export const api = {
  get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => request(endpoint, { method: 'POST', body, ...options }),
  put: (endpoint, body, options) => request(endpoint, { method: 'PUT', body, ...options }),
  delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options }),
};
