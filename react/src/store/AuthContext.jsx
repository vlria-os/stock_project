import { createContext, useContext, useState } from "react";
import { logout as apiLogout, reissue } from "../api/authAPI";

const AuthContext = createContext(null);

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