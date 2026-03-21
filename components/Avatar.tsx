import { useMemo } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  StyleProp, ViewStyle,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';

interface AvatarProps {
  /** Public URL of the user's photo. Falls back to initials when absent. */
  uri?:      string | null;
  /** 1–2 character fallback shown when no photo is available. */
  initials?: string;
  /** Diameter in pixels. Default: 80. */
  size?:     number;
  /** When provided, wraps the avatar in a TouchableOpacity. */
  onPress?:  () => void;
  style?:    StyleProp<ViewStyle>;
}

export function Avatar({
  uri,
  initials = '?',
  size     = 80,
  onPress,
  style,
}: AvatarProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const borderRadius = size / 2;
  const fontSize     = Math.round(size * 0.35);

  const inner = uri ? (
    <Image
      source={{ uri }}
      style={[s.image, { width: size, height: size, borderRadius }]}
    />
  ) : (
    <View style={[s.fallback, { width: size, height: size, borderRadius }]}>
      <Text style={[s.initials, { fontSize }]}>
        {initials.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={style}>
        {inner}
      </TouchableOpacity>
    );
  }

  return <View style={style}>{inner}</View>;
}

const makeStyles = (t: ColorTheme) => StyleSheet.create({
  image: {
    backgroundColor: t.bgCard2,
  },
  fallback: {
    backgroundColor: t.bgCard2,
    borderWidth: 1,
    borderColor: t.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color:      t.textSecondary,
    fontWeight: '500',
  },
});
