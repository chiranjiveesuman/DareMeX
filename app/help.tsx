import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ChevronLeft, HelpCircle, MessageSquare, FileText, ExternalLink } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface HelpItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

export default function HelpScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  
  const helpItems: HelpItem[] = [
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      description: 'Find answers to common questions',
      icon: HelpCircle
    },
    {
      id: 'contact',
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: MessageSquare
    },
    {
      id: 'guide',
      title: 'User Guide',
      description: 'Learn how to use DareMeX',
      icon: FileText
    },
    {
      id: 'community',
      title: 'Community Forum',
      description: 'Connect with other users',
      icon: ExternalLink
    }
  ];
  
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
          Help & Support
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            How can we help you?
          </Text>
          
          {helpItems.map(item => (
            <Pressable 
              key={item.id}
              style={[styles.helpItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}
            >
              <View style={styles.helpItemContent}>
                <View style={styles.iconContainer}>
                  <item.icon size={20} color="#FF4D6A" />
                </View>
                <View>
                  <Text style={[styles.helpItemTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.helpItemDescription, { color: isDark ? '#A1A1AA' : '#71717A' }]}>
                    {item.description}
                  </Text>
                </View>
              </View>
              <ChevronLeft 
                size={20} 
                color={isDark ? '#FFFFFF' : '#000000'} 
                style={{ transform: [{ rotate: '180deg' }] }}
              />
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Popular Topics
          </Text>
          
          {['Getting Started', 'Account Issues', 'Challenge Rules', 'Privacy & Security'].map((topic, index) => (
            <Pressable 
              key={index}
              style={[styles.topicItem, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}
            >
              <Text style={[styles.topicText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {topic}
              </Text>
              <ChevronLeft 
                size={20} 
                color={isDark ? '#FFFFFF' : '#000000'} 
                style={{ transform: [{ rotate: '180deg' }] }}
              />
            </Pressable>
          ))}
        </View>

        <View style={styles.feedbackSection}>
          <Text style={[styles.feedbackTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            We value your feedback
          </Text>
          <Text style={[styles.feedbackDescription, { color: isDark ? '#A1A1AA' : '#71717A' }]}>
            Help us improve DareMeX by sharing your thoughts and suggestions
          </Text>
          <Pressable style={styles.feedbackButton}>
            <Text style={styles.feedbackButtonText}>
              Send Feedback
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
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  helpItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpItemTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: 4,
  },
  helpItemDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  topicText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  feedbackSection: {
    backgroundColor: '#FF4D6A',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  feedbackTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  feedbackDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 16,
    textAlign: 'center',
  },
  feedbackButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  feedbackButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FF4D6A',
  },
});
