import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { ChevronLeft, Shield, Eye, Lock, Mail } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, setTheme, isDark } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const { signOut, user } = useAuth();

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'es' : 'en');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      } else {
        router.replace('/(auth)/sign-in');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#09090B' : '#F4F4F5' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
        <Pressable 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={isDark ? '#FFFFFF' : '#000000'} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          Settings
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Account Information
          </Text>
          
          <View style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <View style={styles.settingLabelContainer}>
              <View style={styles.iconContainer}>
                <Mail size={20} color="#FF4D6A" />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  Email Address
                </Text>
                <Text style={[styles.settingValue, { color: isDark ? '#A1A1AA' : '#71717A' }]}>
                  {user?.email}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Appearance
          </Text>
          
          <View style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Dark Mode
            </Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#3e3e3e', true: '#FF4D6A' }}
              thumbColor={'#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Language
          </Text>
          
          <View style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Language
            </Text>
            <View style={styles.languageSelector}>
              <Pressable
                style={[
                  styles.languageOption,
                  locale === 'en' && styles.selectedLanguage,
                  { borderColor: isDark ? '#FFFFFF' : '#000000' }
                ]}
                onPress={() => setLocale('en')}
              >
                <Text style={[
                  styles.languageText,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  EN
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.languageOption,
                  locale === 'es' && styles.selectedLanguage,
                  { borderColor: isDark ? '#FFFFFF' : '#000000' }
                ]}
                onPress={() => setLocale('es')}
              >
                <Text style={[
                  styles.languageText,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  ES
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Privacy & Security
          </Text>
          
          <View style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <View style={styles.settingLabelContainer}>
              <View style={styles.iconContainer}>
                <Shield size={20} color="#FF4D6A" />
              </View>
              <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Activity Status
              </Text>
            </View>
            <Switch
              value={true}
              trackColor={{ false: '#3e3e3e', true: '#FF4D6A' }}
              thumbColor={'#f4f3f4'}
            />
          </View>
          
          <View style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <View style={styles.settingLabelContainer}>
              <View style={styles.iconContainer}>
                <Eye size={20} color="#FF4D6A" />
              </View>
              <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Profile Visibility
              </Text>
            </View>
            <Switch
              value={true}
              trackColor={{ false: '#3e3e3e', true: '#FF4D6A' }}
              thumbColor={'#f4f3f4'}
            />
          </View>
          
          <View style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <View style={styles.settingLabelContainer}>
              <View style={styles.iconContainer}>
                <Lock size={20} color="#FF4D6A" />
              </View>
              <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Two-Factor Authentication
              </Text>
            </View>
            <Switch
              value={false}
              trackColor={{ false: '#3e3e3e', true: '#FF4D6A' }}
              thumbColor={'#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Account
          </Text>
          
          <Pressable style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Edit Profile
            </Text>
          </Pressable>
          
          <Pressable 
            style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}
            onPress={handleSignOut}
          >
            <Text style={[styles.settingLabel, { color: '#FF4D6A' }]}>
              Sign Out
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  settingValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 2,
  },
  languageSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  languageOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedLanguage: {
    backgroundColor: '#FF4D6A',
    borderColor: '#FF4D6A',
  },
  languageText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
});
