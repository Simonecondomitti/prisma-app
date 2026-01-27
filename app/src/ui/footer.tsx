import { Ionicons } from "@expo/vector-icons";
import { router, useSegments } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useAuth } from "../auth/authContext";
import { theme } from "./theme";

export function AppFooter() {
  const segments = useSegments();
  const { user } = useAuth();

  // hide footer on auth routes (login)
  if (segments[0] === "(auth)") return null;

  const isPt = user?.role === "pt";

  // determine selected tab by mapping known route segments to tab keys
  // ignore expo-router grouping segments like "(client)" or "(pt-tabs)"
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

  const TabButton = ({ name, label, icon }: { name: string; label: string; icon: React.ReactNode }) => {
    const selected = current === name;
    return (
      <Pressable
        onPress={() => {
          // decide prefix based on role
          const prefix = isPt ? "(pt-tabs)" : "(client-tabs)";
          const path = "/" + prefix + "/" + name;
          router.push(path as any);
        }}
        style={{ flex: 1, alignItems: "center", paddingVertical: 10 }}
      >
        {React.cloneElement(icon as any, { color: selected ? theme.colors.text : theme.colors.subtext })}
        <Text style={{ color: selected ? theme.colors.text : theme.colors.subtext, fontSize: 12, marginTop: 4 }}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View
      style={{
        borderTopWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface2,
        flexDirection: "row",
        paddingHorizontal: 8,
      }}
    >
      <TabButton name="home" label="Home" icon={<Ionicons name="home" size={20} />} />
      <TabButton name="exercises" label={isPt ? "Gestione" : "Esercizi"} icon={<Ionicons name="barbell" size={20} />} />

      {isPt ? (
        // for PT show both Clienti and Profilo
        <>
          <TabButton name="students" label="Clienti" icon={<Ionicons name="people-outline" size={20} />} />
          <TabButton name="profile" label="Profilo" icon={<Ionicons name="person" size={20} />} />
        </>
      ) : (
        // for clients show only Profilo as the 3rd tab
        <TabButton name="profile" label="Profilo" icon={<Ionicons name="person" size={20} />} />
      )}
    </View>
  );
}

export default AppFooter;
