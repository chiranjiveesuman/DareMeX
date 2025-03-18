import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { colors } from '@/styles/globalStyles';

interface AvatarProps {
  size?: number;
  url?: string;
}

export function Avatar({ size = 40, url }: AvatarProps) {
  return (
    <View style={[
      styles.container,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
      }
    ]}>
      <Image
        source={{
          uri: url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop',
        }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.background.dark,
    borderWidth: 2,
    borderColor: colors.primary,
  },
}); 