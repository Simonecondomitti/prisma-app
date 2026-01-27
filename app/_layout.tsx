import { Stack } from "expo-router";
import { View } from "react-native";
import { AuthProvider } from "./src/auth/authContext";
import { PtStoreProvider } from "./src/pt/PtStore";
import { AppFooter } from "./src/ui/footer";

export default function RootLayout() {
  return (
    <AuthProvider>
      <PtStoreProvider>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
          <AppFooter />
        </View>
      </PtStoreProvider>
    </AuthProvider>
  );
}