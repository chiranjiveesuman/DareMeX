import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { ChatProvider } from '@/context/ChatContext';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  SpaceGrotesk_700Bold as SpaceGroteskBold,
  SpaceGrotesk_500Medium as SpaceGroteskMedium,
} from '@expo-google-fonts/space-grotesk';
import {
  Inter_400Regular as InterRegular,
  Inter_700Bold as InterBold,
} from '@expo-google-fonts/inter';
import { ThemeProvider } from '@/context/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Prevent auto-hiding of splash screen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'SpaceGrotesk-Bold': SpaceGroteskBold,
    'SpaceGrotesk-Medium': SpaceGroteskMedium,
    'Inter-Regular': InterRegular,
    'Inter-Bold': InterBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ChatProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen 
                name="notifications" 
                options={{ 
                  headerShown: false,
                  presentation: 'modal'
                }} 
              />
              <Stack.Screen 
                name="chat/[id]" 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="profile/[id]" 
                options={{ headerShown: false }} 
              />
            </Stack>
            <StatusBar style="light" />
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}