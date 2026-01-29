import { Stack } from "expo-router";

export default function ClientExercisesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="day/[dayId]" />
      <Stack.Screen name="exercise/[exerciseId]" />
    </Stack>
  );
}