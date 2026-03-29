import { useMemo } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { EmptyState } from '@/components/EmptyState';

export default function StoriesScreen() {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <SafeAreaView style={s.root}>
      <ResponsiveShell maxWidth={640} align="start">
        <EmptyState
          icon={Icon.stories}
          title="Stories coming soon"
          subtitle="Read long-form Chinese stories to build your comprehension"
        />
      </ResponsiveShell>
    </SafeAreaView>
  );
}

const makeStyles = (t: ColorTheme) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bg },
});
