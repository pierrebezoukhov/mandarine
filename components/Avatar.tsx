import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  StyleProp, ViewStyle,
} from 'react-native';
import { T } from '@/theme/tokens';

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

const s = StyleSheet.create({
  image: {
    backgroundColor: T.surface2,
  },
  fallback: {
    backgroundColor: T.surface2,
    borderWidth: 1,
    borderColor: T.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color:       T.textSecondary,
    fontWeight:  '500',
    letterSpacing: 1,
  },
});
