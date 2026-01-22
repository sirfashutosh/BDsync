import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, googleProvider, db } from '../services/firebaseConfig';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isDemo: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isDemo: false,
  signIn: async () => { },
  logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // If we already detected demo mode, skip firebase listener
    if (isDemo) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);

          // Use onSnapshot for real-time updates
          const unsubscribeUser = onSnapshot(userDocRef, async (docSnap) => {
            if (docSnap.exists()) {
              setUser(docSnap.data() as UserProfile);
            } else {
              // Create new user profile if it doesn't exist
              const newUser: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || 'User',
                role: 'member',
                teamId: null,
                photoURL: firebaseUser.photoURL || '',
              };
              await setDoc(userDocRef, newUser);
              // Optimistically set user, though snapshot will likely fire again
              setUser(newUser);
            }
            setLoading(false);
          }, (error) => {
            console.error("Error listening to user profile:", error);
            setLoading(false);
          });

          return () => unsubscribeUser();

        } catch (error: any) {
          console.error("Error fetching user profile:", error);
          alert(`Login Error: ${error.message} \n\nPlease report this to support.`);
          setUser(null);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();

    return () => unsubscribe();
  }, [isDemo]);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Error signing in", error);

      // FIX: Catch configuration errors (Invalid API Key OR Unauthorized Domain)
      // This allows the app to function in Demo Mode on preview environments automatically.
      const isConfigError =
        error.code === 'auth/api-key-not-valid' ||
        error.code === 'auth/internal-error' ||
        error.code === 'auth/unauthorized-domain' ||
        error.message?.includes('api-key') ||
        error.message?.includes('domain');

      if (isConfigError) {
        console.warn(`Entering Demo Mode. Auth Error: ${error.code}`);
        setIsDemo(true);
        const demoUser: UserProfile = {
          uid: 'demo-admin-123',
          email: 'admin@bdsync.demo',
          displayName: 'Demo Admin',
          role: 'admin',
          teamId: null,
          photoURL: 'https://ui-avatars.com/api/?name=Demo+Admin&background=0ea5e9&color=fff'
        };
        setUser(demoUser);
      } else {
        alert(`Sign in failed: ${error.message}`);
      }
    }
  };

  const logout = async () => {
    if (isDemo) {
      setIsDemo(false);
      setUser(null);
    } else {
      await signOut(auth);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDemo, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};