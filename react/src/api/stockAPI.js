import instance from "./axiosInstance";

const BASE = `${import.meta.env.VITE_GATEWAY_URL}/stocks`;

export const getStocks = () => instance.get(BASE).then((r) => r.data);

export const getPrice = (code) => instance.get(`${BASE}/${code}/price`).then((r) => r.data);

export const getChart = (code) => instance.get(`${BASE}/${code}/chart`).then((r) => r.data);

export const getWishlist = (token) =>
  instance
    .get(`${BASE}/wishlist`, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data);

export const addWishlist = (code, token) =>
  instance
    .post(`${BASE}/wishlist/${code}`, null, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data);

export const removeWishlist = (code, token) =>
  instance
    .delete(`${BASE}/wishlist/${code}`, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data);

export const checkWishlist = (code, token) =>
  instance
    .get(`${BASE}/wishlist/${code}/check`, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data);