import instance from "./axiosInstance";

const BASE = `${import.meta.env.VITE_GATEWAY_URL}/auth`;

export const signup = (email, password, name) =>
  instance.post(`${BASE}/signup`, { email, password, name }).then((r) => r.data);

export const login = (email, password) =>
  instance.post(`${BASE}/login`, { email, password }).then((r) => r.data);

export const logout = (accessToken) =>
  instance
    .post(`${BASE}/logout`, null, { headers: { Authorization: `Bearer ${accessToken}` } })
    .then((r) => r.data);

export const reissue = (accessToken) =>
  instance
    .post(`${BASE}/reissue`, null, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    })
    .then((r) => r.data);

export const getMe = (accessToken) =>
  instance
    .get(`${BASE}/me`, { headers: { Authorization: `Bearer ${accessToken}` } })
    .then((r) => r.data);

export const deleteMe = (accessToken) =>
  instance
    .delete(`${BASE}/me`, { headers: { Authorization: `Bearer ${accessToken}` } })
    .then((r) => r.data);