import { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { MONO, FS, FW, LS, LH } from '@/theme/tokens';
import { space } from '@/theme/spacing';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';
import { Icon } from '@/theme/icons';

interface FlashcardPreviewProps {
  hanzi: string;
  pinyin: string;
  meaning: string;
  exHanzi?: string;
  exPinyin?: string;
  exMeaning?: string;
  fontFamily?: string;
  fontWeight?: string;
  size?: 'default' | 'compact';
  showOrnaments?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function FlashcardPreview({
  hanzi,
  pinyin,
  meaning,
  exHanzi,
  exPinyin,
  exMeaning,
  fontFamily,
  fontWeight,
  size = 'default',
  showOrnaments = true,
  style,
}: FlashcardPreviewProps) {
  const { colors, fonts } = useTheme();
  const resolvedFamily = fontFamily ?? fonts.hanzi;
  const resolvedWeight = fontWeight ?? fonts.hanziWeight;
  const isCompact = size === 'compact';
  const s = useMemo(() => makeStyles(colors, isCompact), [colors, isCompact]);

  return (
    <View style={[s.card, style]}>
      {showOrnaments && (
        <>
          <Text style={s.ornamentTL}>{Icon.ornament}</Text>
          <Text style={s.ornamentBR}>{Icon.ornament}</Text>
        </>
      )}
      <Text style={[s.hanzi, { fontFamily: resolvedFamily, fontWeight: resolvedWeight as any }]}>
        {hanzi}
      </Text>
      <Text style={s.pinyin}>{pinyin}</Text>
      <Text style={s.meaning}>{meaning}</Text>
      {exHanzi && (
        <View style={s.example}>
          <Text style={[s.exHanzi, { fontFamily: resolvedFamily }]}>{exHanzi}</Text>
          {exPinyin && <Text style={s.exPinyin}>{exPinyin}</Text>}
          {exMeaning && <Text style={s.exMeaning}>{exMeaning}</Text>}
        </View>
      )}
    </View>
  );
}

const makeStyles = (t: ColorTheme, compact: boolean) => StyleSheet.create({
  card: {
    backgroundColor: t.bgCard,
    borderWidth: 1.5,
    borderColor: t.border,
    padding: compact ? space.xxl : space.xxxl,
    alignItems: 'center',
    position: 'relative',
  },
  ornamentTL: {
    position: 'absolute', top: 8, left: 10,
    fontFamily: MONO, fontSize: 10, color: t.inkRedDim,
  },
  ornamentBR: {
    position: 'absolute', bottom: 8, right: 10,
    fontFamily: MONO, fontSize: 10, color: t.inkRedDim,
  },
  hanzi: {
    fontSize: compact ? 72 : FS.hanzi,
    color: t.textHanzi,
    lineHeight: (compact ? 72 : FS.hanzi) * LH.single,
    letterSpacing: LS.tighter * (compact ? 72 : FS.hanzi),
  },
  pinyin: {
    fontFamily: MONO,
    fontSize: compact ? FS.body : FS.pinyin,
    fontStyle: 'italic',
    color: t.inkRedText,
    letterSpacing: LS.wider * (compact ? FS.body : FS.pinyin),
    marginTop: space.md,
  },
  meaning: {
    fontFamily: MONO,
    fontSize: compact ? FS.body : FS.definition,
    fontWeight: FW.light,
    color: t.textPrimary,
    letterSpacing: LS.wide * (compact ? FS.body : FS.definition),
    lineHeight: (compact ? FS.body : FS.definition) * LH.normal,
    marginTop: space.sm,
    textAlign: 'center',
  },
  example: {
    borderTopWidth: 1,
    borderTopColor: t.borderDim,
    marginTop: space.lg,
    paddingTop: space.lg,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  exHanzi: {
    fontSize: FS.definition,
    color: t.textHanzi,
    lineHeight: FS.definition * LH.normal,
  },
  exPinyin: {
    fontFamily: MONO,
    fontSize: FS.exPinyin,
    fontStyle: 'italic',
    color: t.inkRedText,
    letterSpacing: LS.example * FS.exPinyin,
    marginTop: space.xs,
  },
  exMeaning: {
    fontFamily: MONO,
    fontSize: FS.body,
    color: t.textSecondary,
    letterSpacing: LS.wide * FS.body,
    lineHeight: FS.body * LH.normal,
    marginTop: space.xs,
  },
});
