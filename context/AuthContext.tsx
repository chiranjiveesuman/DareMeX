import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/supabase/config';
import { Session, User, AuthError } from '@supabase/supabase-js';

// Define user type
type UserData = {
  id: string;
  email: string;
  username: string;
  avatar?: string;
};

// Define the shape of our auth context
type AuthContextType = {
  user: UserData | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component to wrap our app and make auth object available
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to store user data in AsyncStorage
  const storeUserData = async (userData: UserData) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };

  // Function to get user data from AsyncStorage
  const getUserData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('userData');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  };

  // Update profile function to store username in Supabase
  const updateProfile = async (userId: string, username: string) => {
    try {
      // Check if the profiles table exists by attempting to query it
      const { error: tableCheckError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      // If there's an error, it might be because the table doesn't exist
      if (tableCheckError) {
        console.warn('Profiles table may not exist yet:', tableCheckError.message);
        // Store the profile data locally even if we can't save it to Supabase
        const userData: UserData = {
          id: userId,
          email: '', // We'll update this later when we have the email
          username: username,
        };
        await storeUserData(userData);
        return;
      }

      // If the table exists, proceed with the upsert
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: userId, 
          username: username,
          updated_at: new Date().toISOString() 
        }, { 
          onConflict: 'id' 
        });

      if (error) {
        console.error('Error in profile upsert:', error.message);
        throw error;
      }
    } catch (error: any) {
      console.error('Error updating profile:', error?.message || JSON.stringify(error));
      // Don't throw the error, just log it to prevent app crashes
    }
  };

  // Function to get profile data from Supabase
  const getProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Error getting profile:', error.message);
        return null;
      }
      return data;
    } catch (error: any) {
      console.error('Error getting profile:', error?.message || JSON.stringify(error));
      return null;
    }
  };

  // Effect to set up auth state listener
  useEffect(() => {
    // Check if we have a session
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error.message);
        }
        
        if (session) {
          setSession(session);
          
          // Get user profile from Supabase
          const profile = await getProfile(session.user.id);
          
          // Create user data object
          const userData: UserData = {
            id: session.user.id,
            email: session.user.email || '',
            username: profile?.username || session.user.email?.split('@')[0] || '',
            avatar: profile?.avatar_url,
          };
          
          setUser(userData);
          await storeUserData(userData);
        } else {
          // Try to get user data from AsyncStorage
          const storedUser = await getUserData();
          if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch (error: any) {
        console.error('Error in initializeAuth:', error?.message || JSON.stringify(error));
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up a subscription to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase auth event:', event);
      setSession(session);
      
      try {
        if (event === 'SIGNED_IN' && session) {
          // Get user profile from Supabase
          const profile = await getProfile(session.user.id);
          
          // Create user data object
          const userData: UserData = {
            id: session.user.id,
            email: session.user.email || '',
            username: profile?.username || session.user.email?.split('@')[0] || '',
            avatar: profile?.avatar_url,
          };
          
          setUser(userData);
          await storeUserData(userData);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          await AsyncStorage.removeItem('userData');
        }
      } catch (error: any) {
        console.error('Error in auth state change:', error?.message || JSON.stringify(error));
      }
    });

    // Clean up subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user profile from Supabase
      if (data.user) {
        const profile = await getProfile(data.user.id);
        
        // Create user data object
        const userData: UserData = {
          id: data.user.id,
          email: data.user.email || '',
          username: profile?.username || data.user.email?.split('@')[0] || '',
          avatar: profile?.avatar_url,
        };
        
        setUser(userData);
        await storeUserData(userData);
      }
    } catch (error: any) {
      console.error('Error signing in:', error?.message || JSON.stringify(error));
      throw error;
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create a profile for the new user
        await updateProfile(data.user.id, username);
        
        // Create user data object
        const userData: UserData = {
          id: data.user.id,
          email: data.user.email || '',
          username: username,
          avatar: undefined,
        };
        
        setUser(userData);
        await storeUserData(userData);
      }
    } catch (error: any) {
      console.error('Error signing up:', error?.message || JSON.stringify(error));
      throw error;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      await AsyncStorage.removeItem('userData');
    } catch (error: any) {
      console.error('Error signing out:', error?.message || JSON.stringify(error));
      throw error;
    }
  };

  // Create the auth value object
  const authValue: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};