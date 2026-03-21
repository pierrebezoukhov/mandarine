import { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { FS, FW, LH, LS } from '@/theme/tokens';
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
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={[
        s.base,
        variant === 'primary' ? s.variantPrimary : s.variantSecondary,
        disabled && s.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
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

const makeStyles = (t: ColorTheme) => StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
  },

  variantPrimary: {
    backgroundColor: t.inkRedGlow,
    borderColor: t.inkRedDim,
  },
  variantSecondary: {
    backgroundColor: t.bgCard,
    borderColor: t.border,
  },
  disabled: { opacity: 0.45 },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
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
  iconText:     { fontSize: FS.subheading, color: t.textPrimary, letterSpacing: LS.tight * FS.subheading },
  iconTextMuted:{ color: t.textSecondary },

  body:     { flex: 1 },
  title:    { fontSize: FS.ui, color: t.textPrimary, fontWeight: FW.medium, marginBottom: 3 },
  subtitle: { fontSize: FS.label, color: t.textSecondary, lineHeight: LH.label },
  textMuted:{ color: t.textSecondary },
  arrow:    { fontSize: FS.ui, color: t.textSecondary },
});
