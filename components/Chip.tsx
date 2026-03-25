import { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { MONO, FS, FW, LS } from '@/theme/tokens';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';

interface ChipProps {
  label: string;
  sublabel?: string;
  active: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Chip({ label, sublabel, active, onPress, style }: ChipProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

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

const makeStyles = (t: ColorTheme) => StyleSheet.create({
  chip: {
    backgroundColor: t.bgCard,
    borderWidth: 1,
    borderColor: t.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...(Platform.OS === 'web' ? { transition: 'all 150ms ease' } as any : {}),
  },
  chipActive: {
    backgroundColor: t.inkRedGlow,
    borderColor: t.inkRedDim,
  },

  inner:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: t.textSecondary },
  dotActive:{ backgroundColor: t.inkRed },

  label:       { fontFamily: MONO, fontSize: FS.body, color: t.textSecondary, fontWeight: FW.medium },
  labelActive: { color: t.textPrimary },
  sublabel:    { fontFamily: MONO, fontSize: FS.label, color: t.textSecondary, marginTop: 1 },
});
