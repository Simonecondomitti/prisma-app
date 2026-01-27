import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "./src/auth/authContext";

export default function Index() {
  const { user, isHydrating } = useAuth();

  if (isHydrating) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;

  return user.role === "client"
    ? <Redirect href="/(client)/home" />
    : <Redirect href="/(pt)/home" />;
}