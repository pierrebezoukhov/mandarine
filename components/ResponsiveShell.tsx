import { ReactNode } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';
import { space } from '@/theme/spacing';

interface ResponsiveShellProps {
  children: ReactNode;
  maxWidth?: number;
  /** Desktop alignment: 'center' for auth/modals, 'start' for tab screens */
  align?: 'center' | 'start';
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ResponsiveShell({
  children,
  maxWidth = 520,
  align = 'center',
  fill = true,
  style,
}: ResponsiveShellProps) {
  const { isDesktop } = useResponsive();

  if (!isDesktop) {
    return <View style={[fill && { flex: 1 }, style]}>{children}</View>;
  }

  const isStart = align === 'start';

  return (
    <View
      style={[
        {
          maxWidth,
          width: '100%',
          alignSelf: isStart ? 'flex-start' : 'center',
        },
        isStart && {
          paddingLeft: space.xxxl,
          paddingRight: space.xxxl,
        },
        fill && { flex: 1 },
        style,
      ]}
    >
      {children}
    </View>
  );
}
