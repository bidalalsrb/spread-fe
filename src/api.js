import { clearToken, getToken } from './auth';

const runtimeHost = typeof window !== 'undefined' ? window.location.hostname : '';
const defaultBase =
  runtimeHost === 'localhost' || runtimeHost === '127.0.0.1'
    ? 'http://localhost:8080'
    : '';
const API_BASE = (import.meta.env.VITE_API_BASE_URL || defaultBase).replace(/\/$/, '');

export async function apiFetch(path, options = {}, onUnauthorized) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    clearToken();
    if (onUnauthorized) {
      onUnauthorized();
    }
    throw new Error('unauthorized');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.ok === false) {
    throw new Error(data.message || 'request failed');
  }

  return data;
}
