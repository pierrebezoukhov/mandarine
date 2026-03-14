import { ReactNode } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';

interface ResponsiveShellProps {
  children: ReactNode;
  maxWidth?: number;
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ResponsiveShell({
  children,
  maxWidth = 520,
  fill = true,
  style,
}: ResponsiveShellProps) {
  const { isDesktop } = useResponsive();

  if (!isDesktop) {
    return <View style={[fill && { flex: 1 }, style]}>{children}</View>;
  }

  return (
    <View
      style={[
        { maxWidth, width: '100%', alignSelf: 'center' },
        fill && { flex: 1 },
        style,
      ]}
    >
      {children}
    </View>
  );
}
