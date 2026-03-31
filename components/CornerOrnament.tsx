import { Text } from 'react-native';
import { INCONSOLATA } from '@/theme/tokens';
import { useTheme } from '@/context/ThemeContext';

interface CornerOrnamentProps {
  position: 'tl' | 'tr' | 'bl' | 'br';
  size?: number;
  opacity?: number;
  offset?: number;
  offsetH?: number;
}

const ORNAMENT_CHARS = {
  tl: '┌─',
  tr: '─┐',
  bl: '└─',
  br: '─┘',
} as const;

export function CornerOrnament({
  position,
  size = 8,
  opacity = 0.2,
  offset = 6,
  offsetH = 10,
}: CornerOrnamentProps) {
  const { colors } = useTheme();
  const posStyle = {
    tl: { top: offset, left: offsetH },
    tr: { top: offset, right: offsetH },
    bl: { bottom: offset, left: offsetH },
    br: { bottom: offset, right: offsetH },
  }[position];

  return (
    <Text style={[{
      position: 'absolute',
      fontFamily: INCONSOLATA,
      fontSize: size,
      color: colors.textPrimary,
      opacity: opacity,
    }, posStyle]}>{ORNAMENT_CHARS[position]}</Text>
  );
}
