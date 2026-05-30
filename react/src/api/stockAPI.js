const BASE = `${import.meta.env.VITE_GATEWAY_URL}/stocks`;

async function stockFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw { status: res.status, data };
  return data;
}

export const getStocks = () => stockFetch("");

export const getPrice = (code) => stockFetch(`/${code}/price`);

export const getChart = (code) => stockFetch(`/${code}/chart`);

export const getWishlist = (token) =>
  stockFetch("/wishlist", { headers: { Authorization: `Bearer ${token}` } });

export const addWishlist = (code, token) =>
  stockFetch(`/wishlist/${code}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

export const removeWishlist = (code, token) =>
  stockFetch(`/wishlist/${code}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

export const checkWishlist = (code, token) =>
  stockFetch(`/wishlist/${code}/check`, {
    headers: { Authorization: `Bearer ${token}` },
  });