import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { T, MONO, FS, LS } from '@/theme/tokens';

interface StatCardProps {
  /** Short uppercase label below the value. */
  label: string;
  /** The metric value displayed prominently. */
  value: string | number;
  style?: StyleProp<ViewStyle>;
}

export function StatCard({ label, value, style }: StatCardProps) {
  return (
    <View style={[s.card, style]}>
      <Text style={s.value}>{value}</Text>
      <Text style={s.label}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: T.surface,
    borderWidth:     1,
    borderColor:     T.border,
    borderRadius:    16,
    paddingVertical:   16,
    paddingHorizontal: 12,
    alignItems:      'center',
    justifyContent:  'center',
    minHeight:       80,
  },
  value: {
    fontFamily:    MONO,
    fontSize:      FS.title,
    color:         T.textPrimary,
    marginBottom:  4,
    letterSpacing: LS.tight * FS.title,
  },
  label: {
    fontSize:      FS.label,
    color:         T.textMuted,
    textTransform: 'uppercase',
    letterSpacing: LS.loose * FS.label,
  },
});
