import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { ChevronLeft, Eye, Bell, Shield, Globe2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, setTheme, isDark } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const { user } = useAuth();

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'es' : 'en');
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
          Settings & Privacy
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Account Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Account Information
          </Text>
          
          <View style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Username
            </Text>
            <Text style={[styles.settingValue, { color: isDark ? '#A1A1AA' : '#71717A' }]}>
              {user?.username}
            </Text>
          </View>

          <View style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Email
            </Text>
            <Text style={[styles.settingValue, { color: isDark ? '#A1A1AA' : '#71717A' }]}>
              {user?.email}
            </Text>
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Privacy
          </Text>
          
          <View style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <View style={styles.settingHeader}>
              <Shield size={20} color={isDark ? '#FFFFFF' : '#000000'} />
              <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000', marginLeft: 8 }]}>
                Account Privacy
              </Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: '#3e3e3e', true: '#FF4D6A' }}
              thumbColor={'#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <View style={styles.settingHeader}>
              <Eye size={20} color={isDark ? '#FFFFFF' : '#000000'} />
              <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000', marginLeft: 8 }]}>
                Show Profile
              </Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: '#3e3e3e', true: '#FF4D6A' }}
              thumbColor={'#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <View style={styles.settingHeader}>
              <Globe2 size={20} color={isDark ? '#FFFFFF' : '#000000'} />
              <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000', marginLeft: 8 }]}>
                Public Dares
              </Text>
            </View>
            <Switch
              value={false}
              onValueChange={() => {}}
              trackColor={{ false: '#3e3e3e', true: '#FF4D6A' }}
              thumbColor={'#f4f3f4'}
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Notifications
          </Text>
          
          <View style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <View style={styles.settingHeader}>
              <Bell size={20} color={isDark ? '#FFFFFF' : '#000000'} />
              <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000', marginLeft: 8 }]}>
                Push Notifications
              </Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: '#3e3e3e', true: '#FF4D6A' }}
              thumbColor={'#f4f3f4'}
            />
          </View>
        </View>

        {/* Appearance */}
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

        {/* Language */}
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

        {/* Account Actions */}
        <View style={styles.section}>
          <Pressable 
            style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}
            onPress={() => router.push('/(auth)/sign-in')}
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
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  settingValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
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
