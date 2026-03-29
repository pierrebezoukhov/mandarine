import { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router';
import { MONO, SERIF, FS, FW, LS } from '@/theme/tokens';
import { space } from '@/theme/spacing';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ColorTheme } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { Avatar } from '@/components/Avatar';
import { getInitials } from '@/lib/profile';
import { useResponsive } from '@/hooks/useResponsive';

/** Map route names to Chinese character icons */
const TAB_ICONS: Record<string, string> = {
  home:    Icon.study,
  search:  Icon.search,
  stories: Icon.stories,
};

/** Map route names to display labels */
const TAB_LABELS: Record<string, string> = {
  home:    'STUDY',
  search:  'SEARCH',
  stories: 'STORIES',
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { isMobile, isDesktop } = useResponsive();
  const s = useMemo(() => makeStyles(colors, isDesktop), [colors, isDesktop]);

  const initials = getInitials(user);

  const tabs = state.routes.map((route, index) => {
    const isFocused = state.index === index;
    const icon = TAB_ICONS[route.name] ?? '?';
    const label = TAB_LABELS[route.name] ?? route.name.toUpperCase();

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <TouchableOpacity
        key={route.key}
        style={[
          isDesktop ? s.sidebarTab : s.tab,
          isFocused && (isDesktop ? s.sidebarTabActive : s.tabActive),
        ]}
        onPress={onPress}
        activeOpacity={0.75}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={label}
      >
        <Text style={[s.icon, isFocused && s.iconActive]}>{icon}</Text>
        <Text style={[s.label, isFocused && s.labelActive]}>{label}</Text>
      </TouchableOpacity>
    );
  });

  // ── Desktop: vertical sidebar ──────────────────────────────────────────────
  if (isDesktop) {
    return (
      <View style={s.sidebar}>
        <View style={s.sidebarNav}>{tabs}</View>
        <View style={s.sidebarFooter}>
          <Avatar
            initials={initials}
            size={32}
            onPress={() => router.push('/profile')}
          />
        </View>
      </View>
    );
  }

  // ── Mobile: horizontal bottom bar ──────────────────────────────────────────
  return <View style={s.bar}>{tabs}</View>;
}

const makeStyles = (t: ColorTheme, isDesktop: boolean) => StyleSheet.create({
  // ── Mobile bottom bar ────────────────────────────────────────────────────
  bar: {
    flexDirection: 'row',
    backgroundColor: t.bgCard,
    borderTopWidth: 1,
    borderTopColor: t.border,
    height: 56,
    ...(Platform.OS === 'web' ? { flexShrink: 0 } as any : {}),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderTopWidth: 2,
    borderTopColor: 'transparent',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      transition: 'border-color 150ms ease',
    } as any : {}),
  },
  tabActive: {
    borderTopColor: t.inkRed,
  },

  // ── Desktop sidebar ──────────────────────────────────────────────────────
  sidebar: {
    width: 72,
    backgroundColor: t.bgCard,
    borderRightWidth: 1,
    borderRightColor: t.border,
    justifyContent: 'space-between',
    paddingVertical: space.xl,
    ...(Platform.OS === 'web' ? { flexShrink: 0 } as any : {}),
  },
  sidebarNav: {
    gap: space.xs,
  },
  sidebarTab: {
    alignItems: 'center',
    paddingVertical: space.lg,
    borderLeftWidth: 2,
    borderLeftColor: 'transparent',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      transition: 'border-color 150ms ease, background-color 150ms ease',
    } as any : {}),
  },
  sidebarTabActive: {
    borderLeftColor: t.inkRed,
    backgroundColor: t.inkRedGlow,
  },
  sidebarFooter: {
    alignItems: 'center',
    paddingVertical: space.md,
  },

  // ── Shared icon + label ──────────────────────────────────────────────────
  icon: {
    fontFamily: SERIF,
    fontSize: 20,
    color: t.textFaint,
    lineHeight: 24,
  },
  iconActive: {
    color: t.inkRed,
  },
  label: {
    fontFamily: MONO,
    fontSize: FS.label,
    fontWeight: FW.regular,
    color: t.textFaint,
    letterSpacing: LS.wider * FS.label,
    textTransform: 'uppercase',
  },
  labelActive: {
    color: t.inkRed,
    fontWeight: FW.medium,
  },
});
