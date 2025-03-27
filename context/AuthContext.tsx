import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/supabase/config';
import { Session, User } from '@supabase/supabase-js';
import { generateUniqueUsername } from '@/utils/nameGenerator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

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
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signOut: () => Promise<void>;
  searchUsers: (query: string) => Promise<Array<{ id: string; username: string; avatar_url?: string }>>;
  supabase: typeof supabase;
};

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  searchUsers: async () => [],
  supabase: supabase,
});

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Custom hook to use Supabase instance
export const useSupabase = () => {
  const { supabase } = useAuth();
  return supabase;
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

  // Function to get profile data from Supabase
  const getProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .limit(1);

      if (error) {
        console.warn('Error getting profile:', error.message);
        return null;
      }
      return data?.[0] || null;
    } catch (error: any) {
      console.error('Error getting profile:', error?.message || JSON.stringify(error));
      return null;
    }
  };

  // Update profile function to store username in Supabase
  const updateProfile = async (userId: string, username: string) => {
    try {
      // First check if the username is already taken by another user
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', userId)
        .limit(1);

      if (checkError) {
        console.error('Error checking username:', checkError.message);
        throw checkError;
      }

      if (existingUser && existingUser.length > 0) {
        // Username is taken by another user, generate a new one
        const newUsername = await generateUniqueUsername(supabase);
        return updateProfile(userId, newUsername);
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

      return username;
    } catch (error: any) {
      console.error('Error updating profile:', error?.message || JSON.stringify(error));
      // Generate a new username and try again
      const newUsername = await generateUniqueUsername(supabase);
      return updateProfile(userId, newUsername);
    }
  };

  // Function to search users
  const searchUsers = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${query}%`)
        .limit(10);

      if (error) {
        console.error('Error searching users:', error.message);
        return [];
      }
      return data || [];
    } catch (error: any) {
      console.error('Error searching users:', error?.message || JSON.stringify(error));
      return [];
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, providedUsername?: string) => {
    try {
      setLoading(true);

      // Generate a unique username if not provided
      let username = providedUsername;
      if (!username) {
        username = await generateUniqueUsername(supabase);
      } else {
        // Check if provided username is taken
        const isTaken = await isUsernameTaken(username, supabase);
        if (isTaken) {
          username = await generateUniqueUsername(supabase);
        }
      }

      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create a profile for the new user
        const finalUsername = await updateProfile(data.user.id, username);
        
        // Create user data object
        const userData: UserData = {
          id: data.user.id,
          email: data.user.email || '',
          username: finalUsername,
          avatar: undefined,
        };
        
        setUser(userData);
        await storeUserData(userData);
      }
    } catch (error: any) {
      console.error('Error signing up:', error?.message || JSON.stringify(error));
      throw error;
    } finally {
      setLoading(false);
    }
  };

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
        let profile = await getProfile(data.user.id);
        let username = profile?.username;

        // Only generate a new username if one doesn't exist
        if (!username) {
          username = await generateUniqueUsername(supabase);
          await updateProfile(data.user.id, username);
        }
        
        // Create user data object
        const userData: UserData = {
          id: data.user.id,
          email: data.user.email || '',
          username: username,
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
          let profile = await getProfile(session.user.id);
          let username = profile?.username;

          // Only generate a new username if one doesn't exist
          if (!username) {
            username = await generateUniqueUsername(supabase);
            await updateProfile(session.user.id, username);
          }
          
          // Create user data object
          const userData: UserData = {
            id: session.user.id,
            email: session.user.email || '',
            username: username,
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
          let profile = await getProfile(session.user.id);
          let username = profile?.username;

          // Only generate a new username if one doesn't exist
          if (!username) {
            username = await generateUniqueUsername(supabase);
            await updateProfile(session.user.id, username);
          }
          
          // Create user data object
          const userData: UserData = {
            id: session.user.id,
            email: session.user.email || '',
            username: username,
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

  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear any local state
      setUser(null);
      setSession(null);
      await AsyncStorage.removeItem('userData');
      
      // Use router.replace for navigation
      router.replace('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
      // Still try to redirect even if there's an error
      router.replace('/sign-in');
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
    searchUsers,
    supabase,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};