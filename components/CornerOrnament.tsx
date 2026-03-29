import { Text } from 'react-native';
import { MONO } from '@/theme/tokens';
import { useTheme } from '@/context/ThemeContext';

interface CornerOrnamentProps {
  position: 'tl' | 'tr' | 'bl' | 'br';
  size?: number;
  opacity?: number;
  offset?: number;
  offsetH?: number;
}

export function CornerOrnament({
  position,
  size = 10,
  opacity = 0.5,
  offset = 10,
  offsetH = 14,
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
      fontFamily: MONO,
      fontSize: size,
      color: colors.inkRedDim,
      opacity: opacity,
    }, posStyle]}>+</Text>
  );
}
