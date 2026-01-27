import { Redirect, router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useAuth } from "../src/auth/authContext";

export default function LoginScreen() {
  const { loginAs, user, isHydrating } = useAuth();
  if (isHydrating) return null; // o un loader come in index
  if (user) return <Redirect href={user.role === "client" ? "/(client)/home" : "/(pt)/home"} />;
  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 24, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: "700", color: "#111" }}>Login</Text>
      <Text style={{ fontSize: 16, color: "#444" }}>
        Per ora è finto: scegli un ruolo per testare il flusso.
      </Text>

      <Pressable
        onPress={async () => {
          await loginAs("client");
          router.replace("/(client)/home");
        }}
        style={{ backgroundColor: "#111", padding: 14, borderRadius: 12, alignItems: "center" }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}>Entra come Cliente</Text>
      </Pressable>

      <Pressable
        onPress={async () => {
          await loginAs("pt");
          router.replace("/(pt)/home");
        }}
        style={{ backgroundColor: "#111", padding: 14, borderRadius: 12, alignItems: "center" }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}>Entra come PT</Text>
      </Pressable>
    </View>
  );
}