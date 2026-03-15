// Central export for all design tokens
export { borderRadius } from './borderRadius';
export { colors } from './colors';
export { shadows } from './shadows';
export { spacing } from './spacing';
export { typography } from './typography';

// Re-export everything as a single theme object for convenience
import { borderRadius } from './borderRadius';
import { colors } from './colors';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';

export const theme = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
};
