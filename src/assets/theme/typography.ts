export const typography = {
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 24,
    xl: 28,
  },

  // Font Weights (React Native compatible: 'normal' | 'bold' | '100'...'900')
  fontWeight: {
    normal: 'normal' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: 'bold' as const,
  },

  // Line Heights
  lineHeight: {
    tight: 16,
    normal: 20,
    relaxed: 24,
    loose: 32,
  },
};
