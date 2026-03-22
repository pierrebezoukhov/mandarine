import { useState, useMemo, ReactNode } from 'react';
import {
  TouchableOpacity, View, Text, ActivityIndicator, StyleSheet,
  ViewStyle, StyleProp, Platform,
} from 'react-native';
import { MONO, FS, FW, LS } from '@/theme/tokens';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
interface ButtonProps {
  label: string;
  onPress: () => void;
  /** primary = accent fill | secondary = outlined | ghost = text only */
  variant?: ButtonVariant;
  /** Optional icon element rendered to the left of the label */
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  style,
}: ButtonProps) {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
  const isDisabled = disabled || loading;
  const [hovered, setHovered] = useState(false);

  const webHoverProps = Platform.OS === 'web' && !isDisabled ? {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  } as any : {};

  return (
    <TouchableOpacity
      style={[
        s.base,
        variant === 'primary'   && s.variantPrimary,
        variant === 'secondary' && s.variantSecondary,
        variant === 'ghost'     && s.variantGhost,
        hovered && variant === 'primary'   && s.hoverPrimary,
        hovered && variant === 'secondary' && s.hoverSecondary,
        hovered && variant === 'ghost'     && s.hoverGhost,
        isDisabled && s.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      {...webHoverProps}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.textSecondary} />
        : <View style={s.inner}>
            {icon}
            <Text style={[
              s.label,
              variant === 'primary'   && s.labelPrimary,
              variant === 'secondary' && s.labelSecondary,
              variant === 'ghost'     && s.labelGhost,
            ]}>
              {label}
            </Text>
          </View>
      }
    </TouchableOpacity>
  );
}

const makeStyles = (t: ColorTheme, isDark: boolean) => StyleSheet.create({
  base: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      transition: 'background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease, filter 150ms ease',
      cursor: 'pointer',
    } as any : {}),
  },

  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  // Variants — default
  variantPrimary: {
    backgroundColor: t.inkRed,
  },
  variantSecondary: {
    height: 52,
    borderWidth: 1,
    borderColor: t.border,
  },
  variantGhost: {
    // no background, no border
  },

  // Variants — hover (web only)
  hoverPrimary: Platform.OS === 'web' ? {
    filter: 'brightness(1.12)',
    boxShadow: `0 0 16px ${t.inkRedGlow}`,
  } as any : {},
  hoverSecondary: Platform.OS === 'web' ? {
    borderColor: t.inkRed,
    backgroundColor: isDark ? 'rgba(200,56,42,0.06)' : 'rgba(184,48,30,0.03)',
    boxShadow: `0 0 12px ${t.inkRedGlow}`,
  } as any : {},
  hoverGhost: Platform.OS === 'web' ? {
    backgroundColor: isDark ? 'rgba(200,56,42,0.06)' : 'rgba(184,48,30,0.03)',
  } as any : {},

  disabled: { opacity: 0.18 },

  // Labels — primary: 12px, 500, uppercase, 0.12em
  //          secondary/ghost: 13px, 400, normal case, 0.04em
  label: {
    fontFamily: MONO,
  },
  labelPrimary: {
    color: '#fff',
    fontSize: FS.ctaLabel,
    fontWeight: FW.medium,
    textTransform: 'uppercase',
    letterSpacing: LS.cta * FS.ctaLabel,
  },
  labelSecondary: {
    color: t.textPrimary,
    fontSize: FS.body,
    fontWeight: FW.regular,
    letterSpacing: LS.wide * FS.body,
  },
  labelGhost: {
    color: t.textSecondary,
    fontSize: FS.body,
    fontWeight: FW.regular,
    letterSpacing: LS.wide * FS.body,
  },
});
