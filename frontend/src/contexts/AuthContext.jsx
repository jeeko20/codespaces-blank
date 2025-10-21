import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';

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
    // Check active session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  const signUp = async (email, password, name) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) throw error;

      toast({
        title: 'Compte créé!',
        description: 'Vérifiez votre email pour confirmer votre compte.'
      });

      return { success: true, data };
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error };
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: 'Connexion réussie!',
        description: 'Bienvenue sur Eudushare'
      });

      return { success: true, data };
    } catch (error) {
      toast({
        title: 'Erreur de connexion',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: 'Déconnexion',
        description: 'À bientôt!'
      });

      return { success: true };
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error };
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      toast({
        title: 'Email envoyé',
        description: 'Vérifiez votre email pour réinitialiser votre mot de passe.'
      });

      return { success: true };
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.message,
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
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
