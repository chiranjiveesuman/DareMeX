import { StyleSheet, Dimensions } from 'react-native';
import { useColorScheme } from 'react-native';

// Get window dimensions
const { width, height } = Dimensions.get('window');

// Colors
export const colors = {
  // Primary colors
  primary: '#6366F1',
  primaryLight: '#FF8C94',
  
  // Background colors
  background: {
    dark: '#111827',
    light: '#FFFFFF',
    card: {
      dark: '#1F2937',
      light: '#F3F4F6'
    },
    input: {
      dark: 'rgba(0, 0, 0, 0.2)',
      light: 'rgba(0, 0, 0, 0.05)'
    },
    iconContainer: {
      dark: '#27272A',
      light: '#E5E5E7'
    },
    header: {
      dark: '#FF4D6A',
      light: '#FF4D6A'
    }
  },
  
  // Text colors
  text: {
    primary: {
      dark: '#F9FAFB',
      light: '#111827'
    },
    secondary: {
      dark: '#71717A',
      light: '#71717A'
    },
    error: {
      dark: '#EF4444',
      light: '#EF4444'
    },
    header: {
      dark: '#FFFFFF',
      light: '#FFFFFF'
    },
    light: '#111827',
    dark: '#F9FAFB',
  },
  
  // Utility colors
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
  error: '#EF4444',
  overlay: 'rgba(0, 0, 0, 0.2)',
  success: '#22C55E',
  subtext: {
    light: '#6B7280',
    dark: '#9CA3AF'
  },
};

// Typography
export const typography = {
  fontFamily: {
    regular: 'SpaceGrotesk-Regular',
    medium: 'SpaceGrotesk-Medium',
    bold: 'SpaceGrotesk-Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 60,
};

// Border radius
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 9999,
};

// Gradients - defining individual colors to use directly in LinearGradient
export const gradientColors = {
  primary: {
    start: '#FF4D6A',
    end: '#FF8C94',
  },
  header: {
    start: '#4F46E5',
    end: '#6366F1'
  },
  header: {
    start: '#FF4D6A',
    end: '#FF8C9C',
  },
};

// Helper function to get color based on theme
export const getThemeColor = (colorObj: { dark: string; light: string }, isDark: boolean) => {
  return isDark ? colorObj.dark : colorObj.light;
};

// Common styles
export const createStyles = (isDark: boolean) => StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: isDark ? colors.background.dark : colors.background.light,
  },
  gradientContainer: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: spacing.lg,
    backgroundColor: isDark ? colors.background.dark : colors.background.light,
  },
  
  // Headers
  pageHeader: {
    height: height * 0.25, // Top 1/4th of the page
    width: '100%',
    backgroundColor: colors.background.header.dark,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  headerGradient: {
    height: height * 0.25, // Top 1/4th of the page
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.text.header.dark,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: colors.text.header.dark,
    textAlign: 'center',
    opacity: 0.8,
  },
  
  // Typography
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: isDark ? colors.text.primary.dark : colors.text.primary.light,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: isDark ? colors.text.secondary.dark : colors.text.secondary.light,
    marginBottom: spacing.lg,
  },
  text: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: isDark ? colors.text.primary.dark : colors.text.primary.light,
  },
  
  // Forms
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: isDark ? colors.text.primary.dark : colors.text.primary.light,
    marginBottom: spacing.xs,
  },
  input: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: isDark ? colors.text.primary.dark : colors.text.primary.light,
    backgroundColor: isDark ? colors.background.input.dark : colors.background.input.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    width: '100%',
  },
  errorText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  
  // Buttons
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  buttonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.md,
    color: colors.white,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  buttonOutlineText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.md,
    color: colors.primary,
  },
  
  // Links
  link: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: isDark ? colors.text.secondary.dark : colors.text.secondary.light,
  },
  
  // Tabs
  tabBar: {
    backgroundColor: isDark ? colors.background.card.dark : colors.background.card.light,
    borderTopWidth: 0,
    elevation: 0,
    height: 60,
    paddingBottom: spacing.xs,
  },
  tabBarLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
  },
  
  // Icon containers
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    backgroundColor: isDark ? colors.background.iconContainer.dark : colors.background.iconContainer.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Cards
  card: {
    backgroundColor: isDark ? colors.background.card.dark : colors.background.card.light,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: isDark ? colors.text.primary.dark : colors.text.primary.light,
  },
  cardContent: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: isDark ? colors.text.secondary.dark : colors.text.secondary.light,
  },
  
  // Lists
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  },
  
  // Badges
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '20',
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    color: colors.primary,
  },
  
  // Categories
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: isDark ? colors.background.card.dark : colors.background.card.light,
    borderRadius: borderRadius.lg,
  },
  
  // Media Cards
  mediaCard: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: isDark ? colors.background.card.dark : colors.background.card.light,
    borderRadius: borderRadius.lg,
  },
  
  // Horizontal Lists
  horizontalList: {
    marginHorizontal: -spacing.lg,
  },
  horizontalListContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  // Discover Page
  discoverPage: {
    flex: 1,
    backgroundColor: isDark ? colors.background.dark : colors.background.light,
  },
  discoverHeader: {
    height: height * 0.25, // Top 1/4th of the page
    width: '100%',
    backgroundColor: colors.background.header.dark,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  discoverTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.text.header.dark,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  discoverSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: colors.text.header.dark,
    textAlign: 'center',
    opacity: 0.8,
  },
  discoverCard: {
    backgroundColor: isDark ? colors.background.card.dark : colors.background.card.light,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  discoverCardContent: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: isDark ? colors.text.secondary.dark : colors.text.secondary.light,
  },
});

// Export default styles for backward compatibility
export const globalStyles = createStyles(true);

// Export a hook to get theme-aware styles
export const useThemeStyles = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  return createStyles(isDark);
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  gradientColors,
  globalStyles,
  useThemeStyles,
};
