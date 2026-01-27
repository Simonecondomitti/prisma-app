import { router } from "expo-router";
import { Pressable, Text } from "react-native";
import { useAuth } from "../src/auth/authContext";
import { Screen } from "../src/ui/screen";

export default function ClientProfileTab() {
    const { logout } = useAuth();

    return (
        <Screen>
            <Text style={{ fontSize: 24, fontWeight: "800", color: "#ffffffff" }}>Profilo</Text>

            <Pressable
                onPress={async () => {
                    await logout();
                    router.replace("/(auth)/login");
                }}
                style={{
                    backgroundColor: "#ffffffff",
                    padding: 14,
                    borderRadius: 12,
                    alignItems: "center",
                    marginTop: 10,
                }}
            >
                <Text style={{ color: "#000000ff", fontWeight: "700" }}>Logout</Text>
            </Pressable>
        </Screen>
    );
}