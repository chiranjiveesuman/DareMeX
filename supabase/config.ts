import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

// Replace these with your Supabase project URL and anon key
const supabaseUrl = 'https://xtovsnonyghjnjjcskwe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0b3Zzbm9ueWdoam5qamNza3dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNTg3ODEsImV4cCI6MjA1NzczNDc4MX0.kOR6fnUQKHMWgb1VRDoviCpP1b3Ps1eW4TaafcoelLQ';

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export default supabase;
