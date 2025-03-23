import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { StyleSheet, ViewStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function SafeAreaWrapper({ children, style }: SafeAreaWrapperProps) {
  const { colors, isDark } = useTheme();

  const backgroundColor = colors?.background?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#111827' : '#FFFFFF');

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#FF4D8F', '#FF758C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topBorder}
      />
      <SafeAreaView 
        style={[
          styles.container,
          { backgroundColor },
          style
        ]}
        edges={['top', 'right', 'left']}
      >
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBorder: {
    height: 3,
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 100,
  },
}); 