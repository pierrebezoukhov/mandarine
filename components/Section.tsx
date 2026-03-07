import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { ReactNode } from 'react';
import { T } from '@/theme/tokens';

interface SectionProps {
  label: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Section({ label, children, style }: SectionProps) {
  return (
    <View style={[s.wrap, style]}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  wrap:  { marginBottom: 28 },
  label: {
    fontSize: 10,
    color: T.textMuted,
    letterSpacing: 2.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
});
