import { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { MONO, FS } from '@/theme/tokens';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';

interface ProgressBarProps {
  /** Current card index (1-based for display) */
  current: number;
  total: number;
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({ current, total, style }: ProgressBarProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
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

const makeStyles = (t: ColorTheme) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  track: {
    flex: 1,
    height: 2,
    backgroundColor: t.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: t.inkRed,
  },
  counter: {
    fontFamily: MONO,
    fontSize: FS.progress,
    color: t.textSecondary,
  },
  counterTotal: {
    color: t.textFaint,
  },
});
