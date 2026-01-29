import { Tabs } from "expo-router";
import { AppFooterTabBar } from "../src/ui/footer";

export default function PtTabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <AppFooterTabBar {...props} variant="pt" />}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="exercises" />
      <Tabs.Screen name="students" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}