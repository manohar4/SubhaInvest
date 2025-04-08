import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useLocation } from "wouter";
import { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  phoneNumber: string;
  setPhoneNumber: (phoneNumber: string) => void;
  login: (phoneNumber: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<boolean>;
  createProfile: (name: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isBypassMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for testing
const mockUser: User = {
  id: 1,
  phoneNumber: "+919876543210",
  name: "Test User",
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(mockUser);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [, navigate] = useLocation();

  const login = async (phone: string) => {
    setPhoneNumber(phone);
    setUser(mockUser);
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    setUser(mockUser);
    return true;
  };

  const createProfile = async (name: string): Promise<boolean> => {
    setUser(mockUser);
    return true;
  };

  const logout = () => {
    setUser(mockUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: true,
        phoneNumber,
        setPhoneNumber,
        login,
        verifyOtp,
        createProfile,
        logout,
        isLoading: false,
        isBypassMode: true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
