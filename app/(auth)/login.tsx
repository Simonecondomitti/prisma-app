import { useAuth } from "@/app/src/auth/authContext";
import { theme } from "@/app/src/ui/theme";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

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
    router.replace("/");
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ImageBackground
        source={require("/Users/simonecondomitti/palestra-app/assets/images/prisma.jpg")}
        style={{ width: "100%", height: 500, justifyContent: "center", alignItems: "center" }}>
        {/* overlay scuro */}
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.55)",
          }}
        />
        <ImageBackground
          source={require("/Users/simonecondomitti/palestra-app/assets/images/prima-white-no-bg.png")}
          style={{ width: "100%", height: 500, justifyContent: "center", alignItems: "center" }}>
        </ImageBackground>
      </ImageBackground>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* card form */}
        <View
          style={{
            flex: 1,
            marginTop: -22, // “entra” sull’immagine
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            backgroundColor: theme.colors.bg,
            padding: 22,
            gap: 12,
            borderTopWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: "900" }}>
            Accedi
          </Text>

          <Text style={{ color: theme.colors.subtext, marginBottom: 8 }}>
            Inserisci le credenziali.
          </Text>

          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor="rgba(255,255,255,0.45)"
            autoCapitalize="none"
            style={{
              backgroundColor: theme.colors.surface2,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.lg,
              padding: 14,
              color: theme.colors.text,
            }}
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.45)"
            secureTextEntry
            style={{
              backgroundColor: theme.colors.surface2,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.lg,
              padding: 14,
              color: theme.colors.text,
            }}
          />

          {err ? <Text style={{ color: theme.colors.danger }}>{err}</Text> : null}

          <Pressable onPress={onSubmit} style={{ marginTop: 16 }}>
            <LinearGradient
              colors={[
                "#6A00FF", // viola
                "#0047FF", // blu
                "#00C2FF", // azzurro
                "#00FF85", // verde
                "#B6FF00", // lime
                "#FFD400", // giallo
                "#FF8A00", // arancio
                "#FF2D55", // rosso
                "#B000FF", // fucsia
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: 12,
                borderRadius: 999,
                alignItems: "center",

                // glow esterno
                shadowColor: "#00C2FF",
                shadowOpacity: 0.45,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 8 },
                elevation: 12,
              }}
            >
              {/* highlight lucido */}
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  borderTopLeftRadius: 999,
                  borderTopRightRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.20)",
                }}
              />

              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 22,          // 🔥 dimensione richiesta
                  fontWeight: "900",
                  letterSpacing: 3,

                  // ✨ text shadow
                  textShadowColor: "rgba(7, 1, 1, 0.9)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 4,
                }}
              >
                Login
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => { /* future: forgot password */ }}>
            <Text style={{ color: theme.colors.subtext, textAlign: "center", marginTop: 8 }}>
              Password dimenticata?
            </Text>
          </Pressable>

          {/* helper dev (puoi toglierlo dopo) */}
          <View style={{ marginTop: 14, gap: 4 }}>
            <Text style={{ color: theme.colors.subtext }}>PT: pt / pt123</Text>
            <Text style={{ color: theme.colors.subtext }}>Cliente: c1 / c1123</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}