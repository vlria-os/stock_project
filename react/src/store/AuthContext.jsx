import { createContext, useContext, useState, useEffect, useRef } from "react";
import { logout as apiLogout, reissue } from "../api/authAPI";
import { initAuth } from "../api/axiosInstance";

const AuthContext = createContext(null);

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("token"));

  const saveToken = (token) => {
    setAccessToken(token);
    localStorage.setItem("token", token);
  };

  const handleLogin = (token) => saveToken(token);

  const handleLogout = async () => {
    try {
      await apiLogout(accessToken);
    } catch (_) {}
    setAccessToken(null);
    localStorage.removeItem("token");
  };

  const refresh = async () => {
    try {
      const data = await reissue(accessToken);
      saveToken(data.accessToken);
      return data.accessToken;
    } catch (_) {
      setAccessToken(null);
      localStorage.removeItem("token");
      return null;
    }
  };

  // axios interceptor에 refresh/logout 등록
  const refreshRef = useRef(refresh);
  const logoutRef = useRef(handleLogout);
  refreshRef.current = refresh;
  logoutRef.current = handleLogout;

  useEffect(() => {
    initAuth(
      () => refreshRef.current(),
      () => logoutRef.current()
    );
  }, []);

  // 앱 로드 시 토큰 유효성 검증
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (isTokenExpired(token)) {
      // accessToken 만료 → refreshToken으로 재발급 시도
      reissue(token)
        .then((data) => saveToken(data.accessToken))
        .catch(() => {
          // refreshToken도 만료 → 로그아웃
          setAccessToken(null);
          localStorage.removeItem("token");
        });
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      accessToken,
      isAuthenticated: !!accessToken,
      login: handleLogin,
      logout: handleLogout,
      refresh,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);