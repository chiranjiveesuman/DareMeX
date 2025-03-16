import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ChevronLeft, Shield, Eye, Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function PrivacyScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  
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
          Privacy
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Privacy Settings
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
            Data & Permissions
          </Text>
          
          <Pressable style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Manage Data
            </Text>
          </Pressable>
          
          <Pressable style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Download Your Data
            </Text>
          </Pressable>
          
          <Pressable style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Delete Account
            </Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Legal
          </Text>
          
          <Pressable style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Privacy Policy
            </Text>
          </Pressable>
          
          <Pressable style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Terms of Service
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
});
