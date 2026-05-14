/**
 * Global design tokens for the Livestock app.
 * Redirects to src/constants/theme to maintain a single source of truth.
 */
export * from '../src/constants/theme';
import { Colors as BrandColors } from '../src/constants/theme';

// Compatibility shim for boilerplate components that expect Colors.light/dark
export const Colors = {
  ...BrandColors,
  light: {
    tint: BrandColors.emerald,
    background: BrandColors.white,
    text: BrandColors.textPrimary,
    tabIconDefault: '#999',
    tabIconSelected: BrandColors.emerald,
  },
  dark: {
    tint: BrandColors.emerald,
    background: BrandColors.background,
    text: BrandColors.textPrimary,
    tabIconDefault: '#999',
    tabIconSelected: BrandColors.emerald,
  }
};
