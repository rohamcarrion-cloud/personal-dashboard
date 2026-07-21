import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    console.log("AuthContext: Initializing PocketBase auth state...");
    try {
      if (pb.authStore.isValid) {
        console.log("AuthContext: Valid auth store found for user:", pb.authStore.model?.email);
        setCurrentUser(pb.authStore.model);
      } else {
        console.log("AuthContext: No valid auth store found. User is logged out.");
      }
    } catch (err) {
      console.error("AuthContext: Error during initialization:", err);
      setInitError(err);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    console.log("AuthContext: Attempting login for:", email);
    try {
      const authData = await pb.collection('users').authWithPassword(email, password, { $autoCancel: false });
      setCurrentUser(authData.record);
      console.log("AuthContext: Login successful.");
      return authData;
    } catch (err) {
      console.error("AuthContext: Login failed:", err);
      throw err;
    }
  };

  const logout = () => {
    console.log("AuthContext: Logging out user.");
    try {
      pb.authStore.clear();
      setCurrentUser(null);
    } catch (err) {
      console.error("AuthContext: Error during logout:", err);
    }
  };

  const isAuthenticated = pb.authStore.isValid;

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md bg-destructive/10 border border-destructive/20 p-6 rounded-xl">
          <h2 className="text-lg font-bold text-destructive mb-2">Authentication System Error</h2>
          <p className="text-sm text-destructive/80">{initError.message || "Failed to initialize authentication."}</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated, initialLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};