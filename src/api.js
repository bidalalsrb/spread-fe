import { clearToken, getToken } from './auth';

const runtimeHost = typeof window !== 'undefined' ? window.location.hostname : '';
const defaultBase =
  runtimeHost === 'localhost' || runtimeHost === '127.0.0.1'
    ? 'http://localhost:8080'
    : '';
const API_BASE = (import.meta.env.VITE_API_BASE_URL || defaultBase).replace(/\/$/, '');
const API_LOADING_EVENT = 'api-loading-change';
let pendingRequests = 0;

function emitLoading() {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(
    new CustomEvent(API_LOADING_EVENT, {
      detail: { pending: pendingRequests }
    })
  );
}

function beginRequest() {
  pendingRequests += 1;
  emitLoading();
}

function endRequest() {
  pendingRequests = Math.max(0, pendingRequests - 1);
  emitLoading();
}

export async function apiFetch(path, options = {}, onUnauthorized) {
  beginRequest();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
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
  } finally {
    endRequest();
  }
}

export { API_LOADING_EVENT };
