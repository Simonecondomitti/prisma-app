import { Stack } from "expo-router";
import { AuthProvider } from "./src/auth/authContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}