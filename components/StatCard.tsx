import { useMemo } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { MONO, FS, LS } from '@/theme/tokens';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';

interface StatCardProps {
  /** Short uppercase label below the value. */
  label: string;
  /** The metric value displayed prominently. */
  value: string | number;
  style?: StyleProp<ViewStyle>;
}

export function StatCard({ label, value, style }: StatCardProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[s.card, style]}>
      <Text style={s.value}>{value}</Text>
      <Text style={s.label}>{label}</Text>
    </View>
  );
}

const makeStyles = (t: ColorTheme) => StyleSheet.create({
  card: {
    backgroundColor: t.bgCard,
    borderWidth:     1,
    borderColor:     t.border,
    paddingVertical:   16,
    paddingHorizontal: 12,
    alignItems:      'center',
    justifyContent:  'center',
    minHeight:       80,
  },
  value: {
    fontFamily:    MONO,
    fontSize:      FS.formTitle,
    color:         t.textPrimary,
    marginBottom:  4,
    letterSpacing: LS.tighter * FS.formTitle,
  },
  label: {
    fontSize:      FS.label,
    color:         t.textFaint,
    textTransform: 'uppercase',
    letterSpacing: LS.widest * FS.label,
  },
});
