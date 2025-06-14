import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider } from "../firebase/firebase";
import { signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";

const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On initial mount, load user from sessionStorage
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Listen for Firebase auth state changes (optional, for extra safety)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Do nothing here, or optionally refresh backend token if needed
    });
    return () => unsubscribe();
  }, []);

  // Google Sign-In method
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      return await signInWithPopup(auth, googleProvider);
    } finally {
      setLoading(false);
    }
  };

  // Sign out method
  const signOut = async () => {
    sessionStorage.removeItem("user");
    await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <UserAuthContext.Provider value={{ user, setUser, loading, setLoading, signInWithGoogle, signOut }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => useContext(UserAuthContext);
