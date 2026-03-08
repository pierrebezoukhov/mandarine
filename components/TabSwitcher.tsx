import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { T, FS } from '@/theme/tokens';

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

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tabText:       { fontSize: FS.body, fontWeight: '500', color: T.textMuted },
  tabTextActive: { color: T.textPrimary },
  underline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: T.textPrimary,
  },
});
