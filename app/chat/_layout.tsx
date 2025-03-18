import { Stack } from 'expo-router';
import { ChatProvider } from '@/context/ChatContext';

export default function ChatLayout() {
  return (
    <ChatProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </ChatProvider>
  );
} 