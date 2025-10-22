import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '../hooks/use-toast';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Sign up with email and password
  const signUp = async (userData) => {
    try {
      const { access_token } = await authAPI.register(userData);
      localStorage.setItem('token', access_token);
      
      // Get user data
      const currentUser = await authAPI.getMe();
      setUser(currentUser);

      toast({
        title: 'Compte créé!',
        description: 'Bienvenue sur UnivLoop'
      });

      return { success: true };
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.detail || 'Une erreur est survenue',
        variant: 'destructive'
      });
      return { success: false, error };
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const { access_token } = await authAPI.login({ email, password });
      localStorage.setItem('token', access_token);
      
      // Get user data
      const userData = await authAPI.getMe();
      setUser(userData);

      toast({
        title: 'Connexion réussie!',
        description: 'Bienvenue sur UnivLoop'
      });

      return { success: true };
    } catch (error) {
      toast({
        title: 'Erreur de connexion',
        description: error.response?.data?.detail || 'Email ou mot de passe incorrect',
        variant: 'destructive'
      });
      return { success: false, error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await authAPI.logout();
      setUser(null);

      toast({
        title: 'Déconnexion',
        description: 'À bientôt!'
      });

      return { success: true };
    } catch (error) {
      // Still log out locally even if API call fails
      localStorage.removeItem('token');
      setUser(null);
      return { success: true };
    }
  };

  // Update user profile
  const updateProfile = async (userId, updates) => {
    try {
      const updatedUser = await authAPI.updateUser(userId, updates);
      setUser(updatedUser);
      
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été enregistrées'
      });
      
      return { success: true, data: updatedUser };
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.detail || 'Impossible de mettre à jour le profil',
        variant: 'destructive'
      });
      return { success: false, error };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
