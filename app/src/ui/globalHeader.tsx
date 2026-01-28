import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useSegments } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useAuth } from "../auth/authContext";
import { theme } from "./theme";

export function GlobalHeader() {
    const segments = useSegments();
    const { user } = useAuth();

    // hide header on auth routes (login)
    if (segments[0] === "(auth)") return null;

    // derive current tab like in footer
    const segs = segments.filter((s) => !!s && !String(s).startsWith("(")).map(String);
    const segmentToTabMap: Record<string, string> = {
        home: "home",
        day: "exercises",
        exercise: "exercises",
        exercises: "exercises",
        client: "students",
        clients: "students",
        students: "students",
        profile: "profile",
    };

    let current = "home";
    for (const s of segs) {
        if (segmentToTabMap[s]) {
            current = segmentToTabMap[s];
            break;
        }
    }

    const isProfile = current === "profile";

    const initials = (user?.name ?? "").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

    return (
        <View
            style={{
                height: 64,
                backgroundColor: theme.colors.bg,
                paddingHorizontal: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
            }}
        >
            <View style={{ width: 80 }}>
                {!isProfile && user ? (
                    <Pressable
                        onPress={() => {
                            const prefix = user.role === "pt" ? "(pt-tabs)" : "(client-tabs)";
                            router.push(`/${prefix}/profile` as any);
                        }}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: theme.colors.surface,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <LinearGradient
                            colors={[
                                "#6A00FF", // viola
                                "#105f29ff", // verde
                                "#FF8A00", // arancio
                                "#FF2D55", // rosso
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                borderRadius: 999,
                                alignItems: "center",
                                justifyContent: "center", width: 40,
                                height: 40,
                            }}
                        ><Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 21, textShadowColor: "#000000", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }}>{initials}</Text></LinearGradient>

                    </Pressable>
                ) : null}
            </View>

            <View style={{ flex: 1, alignItems: "center" }}>
                <Image
                    source={require("/Users/simonecondomitti/palestra-app/assets/images/prima-white-no-bg.png")}
                    style={{ width: 100, height: 100, resizeMode: "contain" }}
                />
            </View>

            <View style={{ width: 80, alignItems: "flex-end" }}>
                <Pressable onPress={() => router.push("/modal") as any} style={{ padding: 8 }}>
                    <Ionicons name="notifications-outline" color={theme.colors.subtext} size={24} />
                </Pressable>
            </View>
        </View>
    );
}

export default GlobalHeader;
