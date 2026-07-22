import { useState, useCallback } from 'react';
import { authApi, getAuthToken } from '../lib/apiClient';

export interface UserSession {
  email: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(() => {
    const token = getAuthToken();
    if (token) {
      return { email: 'student@teachme.ai', name: 'Academic Student' };
    }
    return null;
  });

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const userSession = {
      email,
      name: email.split('@')[0],
    };
    setUser(userSession);
    return res;
  }, []);

  const register = useCallback(async (email: string, password: string, firstName?: string, lastName?: string) => {
    const res = await authApi.register({ email, password, firstName, lastName });
    const userSession = {
      email,
      name: firstName ? `${firstName} ${lastName}` : email.split('@')[0],
    };
    setUser(userSession);
    return res;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    setUser,
  };
}
