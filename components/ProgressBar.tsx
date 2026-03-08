import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { T, MONO, FS } from '@/theme/tokens';

interface ProgressBarProps {
  /** Current card index (1-based for display) */
  current: number;
  total: number;
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({ current, total, style }: ProgressBarProps) {
  const progress = total > 0 ? Math.min(current / total, 1) : 0;

  return (
    <View style={[s.row, style]}>
      {/* Track + fill */}
      <View style={s.track}>
        <View style={[s.fill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Counter */}
      <Text style={s.counter}>
        {current}
        <Text style={s.counterTotal}> / {total}</Text>
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  track: {
    flex: 1,
    height: 2,
    backgroundColor: T.surface2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: T.accent,
    borderRadius: 1,
    opacity: 0.7,
  },
  counter: {
    fontFamily: MONO,
    fontSize: FS.caption,
    color: T.textMuted,
  },
  counterTotal: {
    opacity: 0.5,
  },
});
