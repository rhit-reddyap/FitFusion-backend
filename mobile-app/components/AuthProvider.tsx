import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, User } from '../lib/supabase';

// Use User type from supabase.ts

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  applyPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
  isPremium: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Storage keys for persistent auth
  const AUTH_STORAGE_KEY = 'auth_user_data';
  const AUTH_TIMESTAMP_KEY = 'auth_timestamp';
  const AUTH_DURATION = 60 * 24 * 60 * 60 * 1000; // 60 days in milliseconds

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      
      // First, check for stored authentication data
      const [storedUser, storedTimestamp] = await Promise.all([
        AsyncStorage.getItem(AUTH_STORAGE_KEY),
        AsyncStorage.getItem(AUTH_TIMESTAMP_KEY)
      ]);

      // Check if stored auth is still valid (within 60 days)
      if (storedUser && storedTimestamp) {
        const authTime = parseInt(storedTimestamp);
        const now = Date.now();
        
        if (now - authTime < AUTH_DURATION) {
          // Auth is still valid, load stored user
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setLoading(false);
          return;
        } else {
          // Auth expired, clear stored data
          await AsyncStorage.multiRemove([AUTH_STORAGE_KEY, AUTH_TIMESTAMP_KEY]);
        }
      }

      // Check for existing Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Get user profile from database
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          // Create profile if it doesn't exist
          const newProfile = {
            id: session.user.id,
            email: session.user.email || '',
            display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'User',
            is_premium: false,
            is_admin: session.user.email === 'admin@fitfusion.com',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            promo_codes_used: []
          };

          const { error: insertError } = await supabase
            .from('profiles')
            .insert(newProfile);

          if (!insertError) {
            setUser(newProfile);
            // Store auth data for persistence
            await storeAuthData(newProfile);
          }
        } else {
          setUser(profile);
          // Store auth data for persistence
          await storeAuthData(profile);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const storeAuthData = async (userData: User) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      await AsyncStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  };

  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove([AUTH_STORAGE_KEY, AUTH_TIMESTAMP_KEY]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return false;
      }

      if (data.user) {
        // Get or create user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          // Create profile if it doesn't exist
          const newProfile = {
            id: data.user.id,
            email: data.user.email || '',
            display_name: data.user.user_metadata?.display_name || data.user.email?.split('@')[0] || 'User',
            is_premium: false,
            is_admin: data.user.email === 'admin@fitfusion.com',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            promo_codes_used: []
          };

          const { error: insertError } = await supabase
            .from('profiles')
            .insert(newProfile);

          if (!insertError) {
            setUser(newProfile);
            // Store auth data for persistence
            await storeAuthData(newProfile);
            return true;
          }
        } else {
          setUser(profile);
          // Store auth data for persistence
          await storeAuthData(profile);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        return false;
      }

      if (data.user) {
        // Create user profile
        const newProfile = {
          id: data.user.id,
          email: data.user.email || '',
          display_name: displayName,
          is_premium: false,
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          promo_codes_used: []
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile);

        if (!insertError) {
          setUser(newProfile);
          // Store auth data for persistence
          await storeAuthData(newProfile);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Sign up error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      // Clear stored authentication data
      await clearAuthData();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const applyPromoCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('Applying promo code:', code);
      console.log('Current user:', user);
      
      if (!user) {
        console.log('No user found');
        return { success: false, message: 'Please sign in first' };
      }
      
      // Check if user is already premium
      if (user.is_premium) {
        console.log('User already premium');
        return { success: false, message: 'You already have premium access' };
      }
      
      // Check if code is already used
      if (user.promo_codes_used?.includes(code)) {
        console.log('Code already used');
        return { success: false, message: 'This promo code has already been used' };
      }
      
      // Secret promo code validation (case-insensitive)
      if (code.toLowerCase() === 'freshmanfriday') {
        console.log('Valid promo code, updating user...');
        
        const updatedUser = {
          ...user,
          is_premium: true,
          promo_codes_used: [...(user.promo_codes_used || []), code]
        };
        
        console.log('Updated user object:', updatedUser);
        
        // Update user in database
        try {
          console.log('Attempting Supabase update for user:', user.id);
          console.log('Update data:', {
            is_premium: true,
            promo_codes_used: [...(user.promo_codes_used || []), code],
            updated_at: new Date().toISOString()
          });

          const { data, error } = await supabase
            .from('profiles')
            .update({
              is_premium: true,
              promo_codes_used: [...(user.promo_codes_used || []), code],
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select();

          console.log('Supabase update result:', { data, error });

          if (!error) {
            console.log('✅ Supabase update successful! Data:', data);
            setUser(updatedUser);
            return { success: true, message: 'Promo code applied successfully! Welcome to premium!' };
          } else {
            console.error('❌ Supabase error details:', {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            });
            
            // Try a simpler update without promo_codes_used array
            console.log('Trying simpler update without promo_codes_used...');
            const { data: simpleData, error: simpleError } = await supabase
              .from('profiles')
              .update({
                is_premium: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id)
              .select();

            console.log('Simple update result:', { simpleData, simpleError });

            if (!simpleError) {
              console.log('✅ Simple Supabase update successful!');
              setUser(updatedUser);
              return { success: true, message: 'Promo code applied successfully! Welcome to premium!' };
            } else {
              console.error('❌ Simple update also failed:', simpleError);
              // Fallback: Update local state even if Supabase fails
              setUser(updatedUser);
              return { success: true, message: 'Promo code applied successfully! Welcome to premium! (Local update - DB error)' };
            }
          }
        } catch (supabaseError) {
          console.error('❌ Supabase connection error:', supabaseError);
          // Fallback: Update local state if Supabase is completely unavailable
          setUser(updatedUser);
          return { success: true, message: 'Promo code applied successfully! Welcome to premium! (Offline mode)' };
        }
      }
      
      console.log('Invalid promo code');
      return { success: false, message: 'Invalid promo code' };
    } catch (error) {
      console.error('Promo code error:', error);
      return { success: false, message: 'An error occurred. Please try again.' };
    }
  };

  const isPremium = user?.is_premium || false;
  const isAdmin = user?.is_admin || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        applyPromoCode,
        isPremium,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
