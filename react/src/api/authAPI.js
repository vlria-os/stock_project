const BASE = `${import.meta.env.VITE_GATEWAY_URL}/auth`;

async function authFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw { status: res.status, data };
  return data;
}

export const signup = (email, password, name) =>
  authFetch("/signup", { method: "POST", body: JSON.stringify({ email, password, name }) });

export const login = (email, password) =>
  authFetch("/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const logout = (accessToken) =>
  authFetch("/logout", { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } });

export const reissue = (accessToken) =>
  authFetch("/reissue", {
    method: "POST",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

export const getMe = (accessToken) =>
  authFetch("/me", { headers: { Authorization: `Bearer ${accessToken}` } });

export const deleteMe = (accessToken) =>
  authFetch("/me", { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } });