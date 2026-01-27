import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useAuth } from "../src/auth/authContext";

export default function LoginScreen() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async () => {
    setErr(null);
    const ok = await login(username, password);
    if (!ok) {
      setErr("Credenziali non valide");
      return;
    }
    // dopo login, l’index redirecta già in base al ruolo,
    // ma per evitare “flash” facciamo replace su root:
    router.replace("/");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 24, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: "800", color: "#111" }}>Login</Text>

      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username (es: pt, c1, c2, c3)"
        autoCapitalize="none"
        style={{ borderWidth: 1, borderColor: "#eee", borderRadius: 12, padding: 12 }}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password (es: pt123, c1123...)"
        secureTextEntry
        style={{ borderWidth: 1, borderColor: "#eee", borderRadius: 12, padding: 12 }}
      />

      {err ? <Text style={{ color: "red" }}>{err}</Text> : null}

      <Pressable
        onPress={onSubmit}
        style={{ backgroundColor: "#111", padding: 14, borderRadius: 12, alignItems: "center" }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>Entra</Text>
      </Pressable>

      {/* helper per test veloce (facoltativo) */}
      <View style={{ gap: 6, marginTop: 10 }}>
        <Text style={{ color: "#444" }}>Test rapido:</Text>
        <Text style={{ color: "#444" }}>PT → pt / pt123</Text>
        <Text style={{ color: "#444" }}>Cliente → c1 / c1123 (o c2/c3)</Text>
      </View>
    </View>
  );
}