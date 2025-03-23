import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Settings, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import SafeAreaWrapper from '@/components/SafeAreaWrapper';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
    },
    header: {
      alignItems: 'center',
      marginBottom: 24,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: 16,
      backgroundColor: colors.border,
    },
    username: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 24,
      color: colors.text,
      marginBottom: 4,
    },
    email: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors.subtext,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 20,
      color: colors.text,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionText: {
      fontFamily: 'Inter-Medium',
      fontSize: 16,
      color: colors.text,
      marginLeft: 12,
    },
    dangerButton: {
      backgroundColor: isDark ? '#991B1B' : '#FEE2E2',
    },
    dangerText: {
      color: isDark ? '#FCA5A5' : '#991B1B',
    },
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image
            source={{ 
              uri: user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop' 
            }}
            style={styles.avatar}
          />
          <Text style={styles.username}>
            {user?.user_metadata?.username || 'User'}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            style={styles.actionButton}
          >
            <Settings size={24} color={colors.text} />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignOut}
            style={[styles.actionButton, styles.dangerButton]}
          >
            <LogOut size={24} color={isDark ? '#FCA5A5' : '#991B1B'} />
            <Text style={[styles.actionText, styles.dangerText]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}