import { Tabs } from 'expo-router';
import { TabBar } from '@/components/TabBar';
import { useResponsive } from '@/hooks/useResponsive';

export default function TabsLayout() {
  const { isDesktop } = useResponsive();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: isDesktop ? 'left' : 'bottom',
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="home" options={{ title: 'Study' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="stories" options={{ title: 'Stories' }} />
    </Tabs>
  );
}
