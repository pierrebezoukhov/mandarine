import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { T, FS } from '@/theme/tokens';

interface ChipProps {
  label: string;
  sublabel?: string;
  active: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Chip({ label, sublabel, active, onPress, style }: ChipProps) {
  return (
    <TouchableOpacity
      style={[s.chip, active && s.chipActive, style]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={s.inner}>
        <View style={[s.dot, active && s.dotActive]} />
        <View>
          <Text style={[s.label, active && s.labelActive]}>{label}</Text>
          {sublabel !== undefined && (
            <Text style={s.sublabel}>{sublabel}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  chip: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chipActive: {
    backgroundColor: T.accentDim,
    borderColor: T.accentBorder,
  },

  inner:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: T.textMuted },
  dotActive:{ backgroundColor: T.accent },

  label:       { fontSize: FS.body, color: T.textMuted, fontWeight: '500' },
  labelActive: { color: T.textPrimary },
  sublabel:    { fontSize: FS.label, color: T.textMuted, marginTop: 1 },
});
