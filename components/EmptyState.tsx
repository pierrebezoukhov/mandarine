import { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { MONO, FS, FW, LS } from '@/theme/tokens';
import { space } from '@/theme/spacing';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({ icon, title, subtitle, style }: EmptyStateProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[s.wrap, style]}>
      {icon && <Text style={s.icon}>{icon}</Text>}
      <Text style={s.title}>{title}</Text>
      {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const makeStyles = (t: ColorTheme) => StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.massive,
    paddingHorizontal: space.xxl,
  },
  icon: {
    fontFamily: MONO,
    fontSize: FS.formTitle,
    color: t.textFaint,
    marginBottom: space.md,
  },
  title: {
    fontFamily: MONO,
    fontSize: FS.definition,
    fontWeight: FW.medium,
    color: t.textSecondary,
    textAlign: 'center',
    letterSpacing: LS.wide * FS.definition,
  },
  subtitle: {
    fontFamily: MONO,
    fontSize: FS.body,
    color: t.textFaint,
    textAlign: 'center',
    marginTop: space.sm,
    letterSpacing: LS.wide * FS.body,
  },
});
