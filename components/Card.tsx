import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { FS, FW, LH, MONO } from '@/theme/tokens';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';

type CardVariant = 'primary' | 'secondary';

interface CardProps {
  /** Chinese character or short string shown in the icon box */
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  /** primary = accent-tinted | secondary = surface (default) */
  variant?: CardVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Card({
  icon,
  title,
  subtitle,
  onPress,
  variant  = 'secondary',
  disabled = false,
  style,
}: CardProps) {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
  const [hovered, setHovered] = useState(false);

  const webHoverProps = Platform.OS === 'web' && !disabled ? {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  } as any : {};

  return (
    <TouchableOpacity
      style={[
        s.base,
        variant === 'primary' ? s.variantPrimary : s.variantSecondary,
        hovered && s.hovered,
        disabled && s.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      {...webHoverProps}
    >
      {/* Icon box */}
      <View style={[s.iconBox, variant === 'secondary' && s.iconBoxMuted]}>
        <Text style={[s.iconText, variant === 'secondary' && s.iconTextMuted]}>
          {icon}
        </Text>
      </View>

      {/* Body */}
      <View style={s.body}>
        <Text style={[s.title, disabled && s.textMuted]}>{title}</Text>
        <Text style={s.subtitle}>{subtitle}</Text>
      </View>

      {/* Arrow */}
      {!disabled && <Text style={s.arrow}>{'\u2192'}</Text>}
    </TouchableOpacity>
  );
}

const makeStyles = (t: ColorTheme, isDark: boolean) => StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    padding: 20,
    ...(Platform.OS === 'web' ? {
      transition: 'border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease',
      cursor: 'pointer',
    } as any : {}),
  },

  variantPrimary: {
    backgroundColor: t.inkRedGlow,
    borderColor: t.inkRedDim,
  },
  variantSecondary: {
    backgroundColor: t.bgCard,
    borderColor: t.border,
  },

  // Hover — both variants get inkRed border + glow
  hovered: Platform.OS === 'web' ? {
    borderColor: t.inkRed,
    boxShadow: `0 0 12px ${t.inkRedGlow}`,
  } as any : {},

  disabled: { opacity: 0.45 },

  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: t.inkRedGlow,
    borderWidth: 1,
    borderColor: t.inkRedDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxMuted: {
    backgroundColor: t.bgCard2,
    borderColor: t.border,
  },
  iconText:     { fontFamily: MONO, fontSize: FS.pinyin, color: t.textPrimary },
  iconTextMuted:{ color: t.textSecondary },

  body:     { flex: 1 },
  title:    { fontFamily: MONO, fontSize: FS.definition, color: t.textPrimary, fontWeight: FW.medium, marginBottom: 3 },
  subtitle: { fontFamily: MONO, fontSize: FS.label, color: t.textSecondary, lineHeight: FS.label * LH.normal },
  textMuted:{ color: t.textSecondary },
  arrow:    { fontFamily: MONO, fontSize: FS.body, color: t.textSecondary },
});
