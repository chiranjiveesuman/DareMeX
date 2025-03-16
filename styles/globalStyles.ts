import { StyleSheet, Dimensions } from 'react-native';
import { useColorScheme } from 'react-native';

// Get window dimensions
const { width, height } = Dimensions.get('window');

// Colors
export const colors = {
  // Primary colors
  primary: '#FF4D6A',
  primaryLight: '#FF8C94',
  
  // Background colors
  background: {
    dark: '#09090B',
    light: '#F5F5F7',
    card: {
      dark: '#18181B',
      light: '#FFFFFF'
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
      dark: '#FFFFFF',
      light: '#18181B'
    },
    secondary: {
      dark: '#71717A',
      light: '#71717A'
    },
    error: {
      dark: '#FFFFFF',
      light: '#FFFFFF'
    },
    header: {
      dark: '#FFFFFF',
      light: '#FFFFFF'
    }
  },
  
  // Utility colors
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
  error: 'rgba(255, 0, 0, 0.2)',
  overlay: 'rgba(0, 0, 0, 0.2)',
  success: '#4CAF50',
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
    start: '#FF4D6A',
    end: '#FF8C94',
  }
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
    backgroundColor: isDark ? colors.background.input.dark : colors.background.input.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: isDark ? colors.text.primary.dark : colors.text.primary.light,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
  },
  
  // Buttons
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  buttonText: {
    color: colors.white,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
  },
  
  // Links
  link: {
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
  },
  
  // Errors
  errorText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    color: isDark ? colors.text.secondary.dark : colors.text.secondary.light,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    marginRight: spacing.xs,
  },
  
  // Cards
  card: {
    backgroundColor: isDark ? colors.background.card.dark : colors.background.card.light,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: isDark ? colors.text.primary.dark : colors.text.primary.light,
    marginBottom: spacing.sm,
  },
  cardContent: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: isDark ? colors.text.secondary.dark : colors.text.secondary.light,
  },
  
  // Icons
  iconContainer: {
    backgroundColor: isDark ? colors.background.iconContainer.dark : colors.background.iconContainer.light,
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Dividers
  divider: {
    height: 1,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    marginVertical: spacing.md,
  },
  
  // Badges
  badge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: colors.white,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
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
