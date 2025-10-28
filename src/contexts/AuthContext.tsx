"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthResponse } from "@/types/authType";
import { AuthService } from "@/services/authService";
import { decodeJWT } from "@/lib/jwt";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const loadUser = () => {
      try {
        const token = AuthService.getToken();
        const userData = AuthService.getUser();

        if (token && userData) {
          const payload = decodeJWT(token);
          if (payload) {
            setUser({
              id: userData.id,
              email: userData.email,
              fullName: userData.fullName,
              phoneNumber: userData.phoneNumber,
              address: userData.address,
              stepActive: userData.stepActive,
              role: payload.role,
            });
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
        AuthService.clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await AuthService.login({ email, password });
      AuthService.saveAuth(response);

      const payload = decodeJWT(response.jwt);
      if (payload) {
        setUser({
          id: response.id,
          email: response.email,
          fullName: response.fullName,
          phoneNumber: response.phoneNumber,
          address: response.address,
          stepActive: response.stepActive,
          role: payload.role,
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    AuthService.clearAuth();
    setUser(null);
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

