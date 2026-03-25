import { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { FS, FW, MONO } from '@/theme/tokens';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';

interface TabOption {
  label: string;
  value: string;
}

interface TabSwitcherProps {
  tabs: TabOption[];
  value: string;
  onChange: (v: string) => void;
  style?: StyleProp<ViewStyle>;
}

export function TabSwitcher({ tabs, value, onChange, style }: TabSwitcherProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[s.row, style]}>
      {tabs.map(tab => {
        const active = tab.value === value;
        return (
          <TouchableOpacity
            key={tab.value}
            style={s.tab}
            onPress={() => onChange(tab.value)}
            activeOpacity={0.7}
          >
            <Text style={[s.tabText, active && s.tabTextActive]}>
              {tab.label}
            </Text>
            {active && <View style={s.underline} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const makeStyles = (t: ColorTheme) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: t.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tabText:       { fontFamily: MONO, fontSize: FS.body, fontWeight: FW.medium, color: t.textSecondary },
  tabTextActive: { color: t.textPrimary },
  underline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: t.inkRed,
  },
});
