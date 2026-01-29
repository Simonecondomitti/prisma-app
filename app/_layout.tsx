import { Stack } from "expo-router";
import { View } from "react-native";
import { AuthProvider, useAuth } from "./src/auth/authContext";
import { PtStoreProvider } from "./src/pt/PtStore";
import GlobalHeader from "./src/ui/globalHeader";
import { theme } from "./src/ui/theme";

export default function RootLayout() {
  return (
    <AuthProvider>
      <PtStoreProvider>
        <RootWithUser />
      </PtStoreProvider>
    </AuthProvider>
  );
}

function RootWithUser() {
  const { user } = useAuth();
  return (
    <View style={{ flex: 1, paddingTop: user ? 48 : 0, backgroundColor: theme.colors.bg }}>
      <GlobalHeader />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}