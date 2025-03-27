import { Stack } from 'expo-router';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function ChatLayout() {
  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen 
          name="[id]/index"
          options={{
            presentation: 'push'
          }}
        />
      </Stack>
    </ErrorBoundary>
  );
} 