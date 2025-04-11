import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useLocation } from "wouter";
import { User } from "@/lib/types";
import { auth, firestoreDb } from "../firebaseConfig.js";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }
  }, [user, isLoading, navigate]);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(
            doc(firestoreDb, "users", firebaseUser.uid)
          );
          if (userDoc.exists()) {
            setUser({
              uid: firebaseUser.uid,
              phoneNumber: firebaseUser.phoneNumber || "",
              name: userDoc.data().name || "",
              email: userDoc.data().email || "",
              createdAt: userDoc.data().createdAt || new Date().toISOString(),
              role: userDoc.data().role || "customer",
            });
          } else {
            // User exists in Firebase Auth but not in Firestore
            setUser({
              uid: firebaseUser.uid,
              phoneNumber: firebaseUser.phoneNumber || "",
              name: "",
              email: "",
              createdAt: new Date().toISOString(),
              role: "customer",
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast({
            title: "Error",
            description: "Failed to load user data",
            variant: "destructive",
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate("/");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        logout,
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
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return user ? <>{children}</> : null;
}
