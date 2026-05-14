import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  labelStyle,
  disabled,
  ...rest
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? Colors.emerald : Colors.textOnAccent}
        />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.label,
              styles[`label_${variant}` as keyof typeof styles],
              styles[`labelSize_${size}` as keyof typeof styles],
              labelStyle,
            ]}
          >
            {label}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.md,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },

  // ── Variants ─────────────────────────────────────────────────────────────────
  primary: {
    backgroundColor: Colors.emerald,
  },
  secondary: {
    backgroundColor: Colors.gold,
  },
  outline: {
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.emerald,
  },
  ghost: {
    backgroundColor: Colors.transparent,
  },
  danger: {
    backgroundColor: Colors.error,
  },

  // ── Sizes ─────────────────────────────────────────────────────────────────────
  size_sm: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    minHeight: 36,
  },
  size_md: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.base,
    minHeight: 48,
  },
  size_lg: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minHeight: 56,
  },

  // ── Labels ───────────────────────────────────────────────────────────────────
  label: {
    fontWeight: Typography.fontWeight.semiBold,
  },
  label_primary: { color: Colors.textOnAccent },
  label_secondary: { color: Colors.textOnAccent },
  label_outline: { color: Colors.emerald },
  label_ghost: { color: Colors.emerald },
  label_danger: { color: Colors.white },

  labelSize_sm: { fontSize: Typography.fontSize.sm },
  labelSize_md: { fontSize: Typography.fontSize.base },
  labelSize_lg: { fontSize: Typography.fontSize.md },
});

export default Button;
