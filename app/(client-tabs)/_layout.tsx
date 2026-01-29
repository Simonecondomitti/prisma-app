import { Tabs } from "expo-router";
import { AppFooterTabBar } from "../src/ui/footer";

export default function ClientTabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <AppFooterTabBar {...props} variant="client" />}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="exercises" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}