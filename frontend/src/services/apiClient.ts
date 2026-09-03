/**
 * TeachMe HTTP API Client with JWT Bearer interceptor & Fallback Resilience
 */

function resolveApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
  if (!envUrl) {
    return '/api';
  }
  const trimmed = envUrl.trim();
  const clean = trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

export const API_BASE_URL = resolveApiBaseUrl();

export function getAuthToken(): string | null {
  return localStorage.getItem('teachme_jwt_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('teachme_jwt_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('teachme_jwt_token');
}

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

let isAuthenticatingPromise: Promise<string | null> | null = null;

export async function ensureAuthToken(): Promise<string | null> {
  const currentToken = getAuthToken();
  if (currentToken && currentToken !== 'demo-jwt-token-teachme-2026' && !isTokenExpired(currentToken)) {
    return currentToken;
  }

  if (isAuthenticatingPromise) return isAuthenticatingPromise;

  isAuthenticatingPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'student@teachme.ai', password: 'SpringAI2026!' })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          setAuthToken(data.token);
          return data.token;
        }
      } else if (res.status === 401 || res.status === 404) {
        const regRes = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'student@teachme.ai',
            password: 'SpringAI2026!',
            firstName: 'Student',
            lastName: 'AI'
          })
        });
        if (regRes.ok) {
          const regData = await regRes.json();
          if (regData.token) {
            setAuthToken(regData.token);
            return regData.token;
          }
        }
      }
    } catch {
      // Backend might be offline
    } finally {
      isAuthenticatingPromise = null;
    }
    return null;
  })();

  return isAuthenticatingPromise;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has('Authorization') && !endpoint.includes('/auth/')) {
    const validToken = await ensureAuthToken();
    if (validToken) {
      headers.set('Authorization', `Bearer ${validToken}`);
    }
  }

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;

  try {
    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Auto-heal 401/403 with re-authentication
    if ((response.status === 401 || response.status === 403) && !endpoint.includes('/auth/')) {
      clearAuthToken();
      const refreshedToken = await ensureAuthToken();
      if (refreshedToken) {
        headers.set('Authorization', `Bearer ${refreshedToken}`);
        response = await fetch(url, { ...options, headers });
      }
    }

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
    if (contentType?.includes('application/json')) {
      return (await response.json()) as T;
    }
    return (await response.text()) as unknown as T;
  } catch (err: unknown) {
    const error = err as Error;
    console.warn(`[TeachMe API Client] Network request to ${url} failed or mocked:`, error.message);
    throw error;
  }
}
