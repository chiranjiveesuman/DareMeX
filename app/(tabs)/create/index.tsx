import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import SafeAreaWrapper from '@/components/SafeAreaWrapper';

export default function CreateScreen() {
  const { colors, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background[isDark ? 'dark' : 'light'],
    },
    header: {
      padding: 16,
      backgroundColor: colors.background.card[isDark ? 'dark' : 'light'],
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#E5E7EB',
    },
    headerTitle: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 32,
      color: colors.text.primary[isDark ? 'dark' : 'light'],
      marginBottom: 4,
    },
    headerSubtitle: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      color: colors.text.secondary[isDark ? 'dark' : 'light'],
    },
    content: {
      flex: 1,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontFamily: 'SpaceGrotesk-Medium',
      fontSize: 18,
      color: colors.text.primary[isDark ? 'dark' : 'light'],
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create</Text>
          <Text style={styles.headerSubtitle}>Start a new dare challenge</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.text}>Create your dare challenge here</Text>
        </View>
      </View>
    </SafeAreaWrapper>
  );
}