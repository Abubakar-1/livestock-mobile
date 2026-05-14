import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../constants/theme';

type Variant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label';

interface AppTextProps {
  children: React.ReactNode;
  variant?: Variant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
  numberOfLines?: number;
}

/**
 * Opinionated text component that enforces the design system typography.
 * Use this instead of raw <Text> across the app.
 */
const AppText: React.FC<AppTextProps> = ({
  children,
  variant = 'body',
  color,
  align = 'left',
  style,
  numberOfLines,
}) => {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[styles[variant], { color: color ?? styles[variant].color, textAlign: align }, style]}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  display: {
    fontSize: Typography.fontSize.display,
    fontWeight: Typography.fontWeight.extraBold,
    color: Colors.textPrimary,      // #FFFFFF
    lineHeight: Typography.fontSize.display * 1.2,
  },
  h1: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,      // #FFFFFF
    lineHeight: Typography.fontSize.xxl * 1.25,
  },
  h2: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,      // #FFFFFF
    lineHeight: Typography.fontSize.xl * 1.3,
  },
  h3: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,      // #FFFFFF
    lineHeight: Typography.fontSize.lg * 1.4,
  },
  body: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.textSecondary,    // #A0AEC0
    lineHeight: Typography.fontSize.base * 1.5,
  },
  bodySmall: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.textSecondary,    // #A0AEC0
    lineHeight: Typography.fontSize.sm * 1.5,
  },
  caption: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.textMuted,        // #4A5568
    lineHeight: Typography.fontSize.xs * 1.5,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,    // #A0AEC0
    lineHeight: Typography.fontSize.sm * 1.4,
  },
});

export default AppText;
