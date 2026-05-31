import axios from "axios";

let _refresh = async () => null;
let _logout = () => {};

export function initAuth(refresh, logout) {
  _refresh = refresh;
  _logout = logout;
}

const instance = axios.create({
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// 토큰 자동 주입 (명시적으로 넘긴 경우 우선)
instance.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 → reissue → 재시도
instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const skipUrls = ["/reissue", "/logout"];
    const shouldSkip = skipUrls.some((u) => original.url?.includes(u));

    if (error.response?.status === 401 && !original._retry && !shouldSkip) {
      original._retry = true;
      const newToken = await _refresh();
      if (!newToken) {
        _logout();
        return Promise.reject({ status: 401, data: null });
      }
      original.headers.Authorization = `Bearer ${newToken}`;
      return instance(original);
    }

    return Promise.reject({
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default instance;