/**
 * TeachMe HTTP API Client with JWT Bearer interceptor & Fallback Resilience
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('teachme_jwt_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('teachme_jwt_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('teachme_jwt_token');
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorBody);
      } catch {
        errorJson = { message: errorBody || `HTTP ${response.status} ${response.statusText}` };
      }
      throw new Error(errorJson.message || errorJson.error || `Request failed with status ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return (await response.json()) as T;
    }
    return (await response.text()) as unknown as T;
  } catch (err: unknown) {
    const error = err as Error;
    console.warn(`[TeachMe API Client] Network request to ${url} failed or mocked:`, error.message);
    throw error;
  }
}
