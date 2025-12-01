// Authentication Context
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/config/firebase";
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout as authLogout,
} from "@/services/authService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authError: string;
  clearAuthError: () => void;
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const clearAuthError = () => setAuthError("");

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    setLoading(true);
    setAuthError("");
    try {
      await registerWithEmail(email, password, displayName);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Đã xảy ra lỗi";
      setAuthError(errorMessage);
      throw error; // Throw lỗi lên để AuthPage có thể bắt
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setAuthError("");
    try {
      await loginWithEmail(email, password);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Đã xảy ra lỗi";
      setAuthError(errorMessage);
      throw error; // Throw lỗi lên để AuthPage có thể bắt
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogleHandler = async () => {
    setLoading(true);
    setAuthError("");
    try {
      await loginWithGoogle();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Đăng nhập Google thất bại";
      setAuthError(errorMessage);
      throw error; // Throw lỗi lên để AuthPage có thể bắt
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authLogout();
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    authError,
    clearAuthError,
    register,
    login,
    loginWithGoogle: loginWithGoogleHandler,
    logout,
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
