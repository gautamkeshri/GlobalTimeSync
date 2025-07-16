import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User as FirebaseUser, onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Firebase is configured
    const isFirebaseConfigured = 
      import.meta.env.VITE_FIREBASE_API_KEY && 
      import.meta.env.VITE_FIREBASE_PROJECT_ID && 
      import.meta.env.VITE_FIREBASE_APP_ID;

    if (!isFirebaseConfigured) {
      // Create a guest user when Firebase is not configured
      const createGuestUser = async () => {
        try {
          const response = await apiRequest("POST", "/api/auth/guest", {});
          const userData = await response.json();
          setUser(userData);
          setFirebaseUser(null);
          localStorage.setItem("timesync_user", JSON.stringify(userData));
        } catch (err) {
          console.error("Error creating guest user:", err);
          setError("Failed to create guest session");
        }
        setLoading(false);
      };
      
      createGuestUser();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      setError(null);
      
      if (firebaseUser) {
        try {
          // Get Firebase ID token
          const token = await firebaseUser.getIdToken();
          
          // Send user data to backend
          const response = await apiRequest("POST", "/api/auth/login", {
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            token,
          });
          
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem("timesync_user", JSON.stringify(userData));
        } catch (err) {
          console.error("Error syncing user with backend:", err);
          setError("Failed to sync user data");
        }
      } else {
        setUser(null);
        localStorage.removeItem("timesync_user");
      }
      
      setLoading(false);
    });

    // Handle redirect result
    getRedirectResult(auth).catch((error) => {
      console.error("Redirect error:", error);
      setError("Authentication failed");
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
