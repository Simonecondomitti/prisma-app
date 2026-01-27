import { Stack } from "expo-router";
import { AuthProvider } from "./src/auth/authContext";
import { PtStoreProvider } from "./src/pt/PtStore";

export default function RootLayout() {
  return (
    <AuthProvider>
      <PtStoreProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </PtStoreProvider>
    </AuthProvider>
  );
}