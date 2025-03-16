import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ChevronLeft, Bell, MessageSquare, Award, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: React.ComponentType<any>;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: 'challenges',
      title: 'New Challenges',
      description: 'Get notified about new challenges',
      enabled: true,
      icon: Bell
    },
    {
      id: 'messages',
      title: 'Messages',
      description: 'Get notified when you receive a message',
      enabled: true,
      icon: MessageSquare
    },
    {
      id: 'achievements',
      title: 'Achievements',
      description: 'Get notified when you earn an achievement',
      enabled: true,
      icon: Award
    },
    {
      id: 'likes',
      title: 'Likes & Comments',
      description: 'Get notified when someone likes or comments on your content',
      enabled: false,
      icon: Heart
    }
  ]);

  const toggleNotification = (id: string) => {
    setNotificationSettings(settings => 
      settings.map(setting => 
        setting.id === id 
          ? { ...setting, enabled: !setting.enabled } 
          : setting
      )
    );
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
          Notifications
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Push Notifications
          </Text>
          
          {notificationSettings.map(setting => (
            <View 
              key={setting.id}
              style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}
            >
              <View style={styles.settingLabelContainer}>
                <View style={styles.iconContainer}>
                  <setting.icon size={20} color="#FF4D6A" />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    {setting.title}
                  </Text>
                  <Text style={[styles.settingDescription, { color: isDark ? '#A1A1AA' : '#71717A' }]}>
                    {setting.description}
                  </Text>
                </View>
              </View>
              <Switch
                value={setting.enabled}
                onValueChange={() => toggleNotification(setting.id)}
                trackColor={{ false: '#3e3e3e', true: '#FF4D6A' }}
                thumbColor={'#f4f3f4'}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Email Notifications
          </Text>
          
          <View style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Email Notifications
            </Text>
            <Switch
              value={false}
              trackColor={{ false: '#3e3e3e', true: '#FF4D6A' }}
              thumbColor={'#f4f3f4'}
            />
          </View>
          
          <View style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Marketing Emails
            </Text>
            <Switch
              value={false}
              trackColor={{ false: '#3e3e3e', true: '#FF4D6A' }}
              thumbColor={'#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Notification Schedule
          </Text>
          
          <Pressable style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Do Not Disturb
            </Text>
          </Pressable>
          
          <Pressable style={[styles.settingItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Schedule Quiet Hours
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
    flex: 1,
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
  settingDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
});
