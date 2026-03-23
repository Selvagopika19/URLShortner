import axios from 'axios';
import { getRequestErrorMessage } from '../utils/apiErrors.js';

/**
 * Base URL: empty uses same origin (Vite dev proxy forwards /api → Express on :5000).
 * Set VITE_API_URL only for production builds pointing at a remote API.
 */
const baseURL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

/** Attach JWT from localStorage for every request after login */
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

/** Set from the app shell when session expires (401 from API). */
let onUnauthorized = () => {};
export function setUnauthorizedHandler(fn) {
  onUnauthorized = typeof fn === 'function' ? fn : () => {};
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    const isAuthAttempt =
      url.includes('/api/auth/login') || url.includes('/api/auth/register');
    if (err.response?.status === 401 && !isAuthAttempt) {
      onUnauthorized();
    }
    const message = getRequestErrorMessage(err);
    const e = new Error(message);
    e.status = err.response?.status;
    e.isNetworkError = !err.response;
    return Promise.reject(e);
  }
);

/** Auth */
export async function registerUser(payload) {
  const { data } = await api.post('/api/auth/register', payload);
  if (!data?.success || !data?.data?.token) {
    throw new Error(data?.message || 'Registration failed');
  }
  return data.data;
}

export async function loginUser(payload) {
  const { data } = await api.post('/api/auth/login', payload);
  if (!data?.success || !data?.data?.token) {
    throw new Error(data?.message || 'Login failed');
  }
  return data.data;
}

/** URLs */
export async function fetchUrls() {
  const { data } = await api.get('/api/url');
  return data.data;
}

export async function createShortUrl(payload) {
  const { data } = await api.post('/api/url', payload);
  return data.data;
}

export async function removeUrl(id) {
  await api.delete(`/api/url/${id}`);
}

export async function fetchUrlAnalytics(id, params) {
  const { data } = await api.get(`/api/url/${id}/analytics`, { params });
  return data.data;
}

export async function fetchCollections() {
  const { data } = await api.get('/api/collections');
  return data?.data ?? [];
}

export async function createCollection(payload) {
  const { data } = await api.post('/api/collections', payload);
  return data?.data;
}

export async function removeCollection(id) {
  await api.delete(`/api/collections/${id}`);
}

export async function fetchCollectionUrls(id) {
  const { data } = await api.get(`/api/collections/${id}/urls`);
  return data?.data;
}

export async function fetchCollectionAnalytics(id) {
  const { data } = await api.get(`/api/collections/${id}/analytics`);
  return data?.data;
}

/** ───────────────────────────────────────────────────
 *  Compatibility aliases — used by page components
 * ─────────────────────────────────────────────────── */

/**
 * getUrls(params?) → returns axios-like { data: { urls: [...] } }
 * Pages use: r.data?.urls ?? r.data ?? []
 */
export async function getUrls(params) {
  const { data } = await api.get('/api/url', { params });
  // Normalise: backend may return { success, data: [...] } or { success, data: { urls, total } }
  const urls = Array.isArray(data?.data) ? data.data : (data?.data?.urls ?? []);
  return { data: { urls } };
}

/**
 * createUrl(payload) → returns axios-like { data: { url: {...} } }
 */
export async function createUrl(payload) {
  const { data } = await api.post('/api/url', payload);
  return { data: { url: data?.data ?? data } };
}

/**
 * deleteUrl(id)
 */
export async function deleteUrl(id) {
  await api.delete(`/api/url/${id}`);
}

/**
 * getUrlAnalytics(id) → returns axios-like { data: { url, visits } }
 */
export async function getUrlAnalytics(id) {
  const { data } = await api.get(`/api/url/${id}/analytics`);
  return { data: data?.data ?? data };
}
