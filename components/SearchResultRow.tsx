import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { MONO, SERIF, FS, FW, LS, LH } from '@/theme/tokens';
import { space } from '@/theme/spacing';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { Badge } from '@/components/Badge';

export type MasteryLevel = 'new' | 'review' | 'hard';

interface SearchResultRowProps {
  hanzi: string;
  pinyin: string;
  meaning: string;
  hskLevel: number;
  mastery?: MasteryLevel;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SearchResultRow({
  hanzi,
  pinyin,
  meaning,
  hskLevel,
  mastery,
  onPress,
  style,
}: SearchResultRowProps) {
  const { colors, fonts } = useTheme();
  const s = useMemo(() => makeStyles(colors, fonts.hanzi), [colors, fonts.hanzi]);
  const [hovered, setHovered] = useState(false);

  const webHoverProps = Platform.OS === 'web' ? {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  } as any : {};

  const dotStyle = mastery === 'hard'
    ? s.dotHard
    : mastery === 'review'
      ? s.dotReview
      : s.dotNew;

  return (
    <TouchableOpacity
      style={[s.row, hovered && s.rowHovered, style]}
      onPress={onPress}
      activeOpacity={0.75}
      {...webHoverProps}
    >
      <View style={s.leading}>
        {mastery && <View style={[s.dot, dotStyle]} />}
        <Text style={s.hanzi}>{hanzi}</Text>
      </View>

      <View style={s.body}>
        <Text style={s.meta} numberOfLines={1}>
          {pinyin}
          <Text style={s.separator}> {Icon.separator} </Text>
          {meaning}
        </Text>
      </View>

      <Badge label={`HSK ${hskLevel}`} />
    </TouchableOpacity>
  );
}

const makeStyles = (t: ColorTheme, hanziFont: string) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    gap: space.md,
    borderBottomWidth: 1,
    borderBottomColor: t.borderDim,
    ...(Platform.OS === 'web' ? {
      transition: 'background-color 150ms ease',
      cursor: 'pointer',
    } as any : {}),
  },
  rowHovered: {
    backgroundColor: t.inkRedGlow,
  },

  leading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotNew:    { backgroundColor: t.textFaint },
  dotReview: { backgroundColor: t.green },
  dotHard:   { backgroundColor: t.inkRed },

  hanzi: {
    fontFamily: hanziFont,
    fontSize: FS.pinyin,
    color: t.textHanzi,
    lineHeight: FS.pinyin * LH.single,
  },

  body: {
    flex: 1,
  },
  meta: {
    fontFamily: MONO,
    fontSize: FS.body,
    color: t.textSecondary,
    letterSpacing: LS.wide * FS.body,
    lineHeight: FS.body * LH.normal,
  },
  separator: {
    color: t.textFaint,
  },
});
