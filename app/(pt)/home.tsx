import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useAuth } from "../src/auth/authContext";
import { RequireAuth } from "../src/auth/requireAuth";

export default function PtHome() {
  const { user, logout } = useAuth();

  return (
    <RequireAuth role="pt">
      <View style={{ flex: 1, backgroundColor: "#fff", padding: 24, justifyContent: "center", gap: 12 }}>
        <Text style={{ fontSize: 28, fontWeight: "700", color: "#111" }}>Home PT</Text>
        <Text style={{ fontSize: 16, color: "#444" }}>
          Utente: {user?.name} ({user?.id}) — ruolo: {user?.role}
        </Text>

        <Pressable
          onPress={() => {
            logout();
            router.replace("/(auth)/login");
          }}
          style={{ backgroundColor: "#111", padding: 14, borderRadius: 12, alignItems: "center" }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}>Logout</Text>
        </Pressable>
      </View>
    </RequireAuth>
  );
}