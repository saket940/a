import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useGetMe } from "@workspace/api-client-react";
import type { UserProfile } from "@workspace/api-client-react";

interface AuthContextType {
  user: UserProfile | undefined;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user?: UserProfile) => void;
  logout: () => void;
  authHeaders: { Authorization?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("internhub_token"));
  const [localUser, setLocalUser] = useState<UserProfile | undefined>(undefined);
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const { data: fetchedUser, isLoading } = useGetMe({
    query: {
      enabled: !!token && !localUser,
      retry: false,
    },
    request: { headers: authHeaders }
  });

  const user = localUser ?? fetchedUser;

  const login = useCallback((newToken: string, userProfile?: UserProfile) => {
    localStorage.setItem("internhub_token", newToken);
    setToken(newToken);
    if (userProfile) {
      setLocalUser(userProfile);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("internhub_token");
    setToken(null);
    setLocalUser(undefined);
    // Redirect based on current path
    if (window.location.pathname.startsWith("/admin")) {
      window.location.href = "/admin/login";
    } else {
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem("internhub_token");
      setToken(stored);
      if (!stored) setLocalUser(undefined);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading: isLoading && !!token && !localUser,
        login,
        logout,
        authHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
