import React, { createContext, useState, useEffect } from 'react';
import API from '../api/axiosClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('studylens_token') || '');
  const [customApiKey, setCustomApiKeyState] = useState(localStorage.getItem('studylens_gemini_key') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await API.get('/auth/profile');
        setUser(res.data);
      } catch (err) {
        console.error('Failed to load user profile:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token: userToken, ...userData } = res.data;
    localStorage.setItem('studylens_token', userToken);
    setToken(userToken);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, extraData = {}) => {
    const res = await API.post('/auth/register', { name, email, password, ...extraData });
    const { token: userToken, ...userData } = res.data;
    localStorage.setItem('studylens_token', userToken);
    setToken(userToken);
    setUser(userData);
    return userData;
  };

  const updateProfile = async (profileData) => {
    const res = await API.put('/auth/profile', profileData);
    const { token: userToken, ...userData } = res.data;
    if (userToken) {
      localStorage.setItem('studylens_token', userToken);
      setToken(userToken);
    }
    setUser(userData);
    return userData;
  };

  const logout = () => {
    try {
      if (token) API.post('/auth/logout').catch(() => {});
    } catch (e) {}
    localStorage.removeItem('studylens_token');
    setToken('');
    setUser(null);
  };

  const setCustomApiKey = (key) => {
    localStorage.setItem('studylens_gemini_key', key);
    setCustomApiKeyState(key);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        updateProfile,
        logout,
        customApiKey,
        setCustomApiKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
