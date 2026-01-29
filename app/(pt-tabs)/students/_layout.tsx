import { Stack } from "expo-router";

export default function StudentsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[clientId]/add-day" />
      <Stack.Screen name="[clientId]/day/[dayId]" />
      <Stack.Screen name="[clientId]/edit/[dayId]" />
      <Stack.Screen name="[clientId]/edit/[dayId]/add-exercise" />
    </Stack>
  );
}