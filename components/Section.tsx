import { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { ReactNode } from 'react';
import { FS, LS } from '@/theme/tokens';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';

interface SectionProps {
  label: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Section({ label, children, style }: SectionProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[s.wrap, style]}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

const makeStyles = (t: ColorTheme) => StyleSheet.create({
  wrap:  { marginBottom: 28 },
  label: {
    fontSize: FS.label,
    letterSpacing: LS.loose * FS.label,
    color: t.textFaint,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
});
