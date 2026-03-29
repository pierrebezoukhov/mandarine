import { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { MONO, FS, FW, LS } from '@/theme/tokens';
import { space } from '@/theme/spacing';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';

type BadgeVariant = 'default' | 'accent' | 'success' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const variantStyle = {
    default: s.varDefault,
    accent:  s.varAccent,
    success: s.varSuccess,
    muted:   s.varMuted,
  }[variant];

  const textStyle = {
    default: s.textDefault,
    accent:  s.textAccent,
    success: s.textSuccess,
    muted:   s.textMuted,
  }[variant];

  return (
    <View style={[s.badge, variantStyle, style]}>
      <Text style={[s.label, textStyle]}>{label}</Text>
    </View>
  );
}

const makeStyles = (t: ColorTheme) => StyleSheet.create({
  badge: {
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  label: {
    fontFamily: MONO,
    fontSize: FS.label,
    fontWeight: FW.medium,
    letterSpacing: LS.wider * FS.label,
    textTransform: 'uppercase',
  },

  varDefault:  { backgroundColor: t.bgCard2 },
  textDefault: { color: t.textSecondary },

  varAccent:   { backgroundColor: t.inkRedGlow },
  textAccent:  { color: t.inkRedText },

  varSuccess:  { backgroundColor: t.greenDim },
  textSuccess: { color: t.green },

  varMuted:    { backgroundColor: 'transparent' },
  textMuted:   { color: t.textFaint },
});
