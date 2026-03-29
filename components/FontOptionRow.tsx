import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { MONO, FS, FW, LS } from '@/theme/tokens';
import { space } from '@/theme/spacing';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';
import { Icon } from '@/theme/icons';

interface FontOptionRowProps {
  character: string;
  fontFamily: string;
  fontWeight?: string;
  label: string;
  description: string;
  active: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function FontOptionRow({
  character,
  fontFamily,
  fontWeight = '400',
  label,
  description,
  active,
  onPress,
  style,
}: FontOptionRowProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [hovered, setHovered] = useState(false);

  const webHoverProps = Platform.OS === 'web' ? {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  } as any : {};

  return (
    <TouchableOpacity
      style={[s.row, hovered && s.rowHovered, active && s.rowActive, style]}
      onPress={onPress}
      activeOpacity={0.75}
      {...webHoverProps}
    >
      <View style={s.charBox}>
        <Text style={[s.char, { fontFamily, fontWeight: fontWeight as any }]}>
          {character}
        </Text>
      </View>
      <View style={s.info}>
        <Text style={s.label}>{label}</Text>
        <Text style={s.desc}>{description}</Text>
      </View>
      <Text style={[s.check, active && s.checkActive]}>{Icon.correct}</Text>
    </TouchableOpacity>
  );
}

const makeStyles = (t: ColorTheme) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.bgCard,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      transition: 'border-color 150ms ease, background-color 150ms ease',
    } as any : {}),
  },
  rowHovered: {
    borderColor: t.inkRed,
    backgroundColor: t.inkRedGlow,
  },
  rowActive: {
    borderColor: t.inkRedDim,
    backgroundColor: t.inkRedGlow,
  },

  charBox: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  char: {
    fontSize: 28,
    color: t.textHanzi,
    lineHeight: 36,
  },

  info: { flex: 1 },
  label: {
    fontFamily: MONO,
    fontSize: FS.body,
    fontWeight: FW.medium,
    color: t.textPrimary,
    letterSpacing: LS.wide * FS.body,
    marginBottom: 1,
  },
  desc: {
    fontFamily: MONO,
    fontSize: FS.label,
    color: t.textSecondary,
    letterSpacing: LS.wide * FS.label,
  },

  check: {
    fontFamily: MONO,
    fontSize: FS.definition,
    color: t.inkRed,
    opacity: 0,
  },
  checkActive: {
    opacity: 1,
  },
});
