import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { theme } from "./theme";

type Props = {
  title: string;
  showBack?: boolean;
  subtitle?: string;
};

export function AppHeader({ title, showBack, subtitle }: Props) {
  return (
    <View style={{ gap: 6 }}>
      {showBack ? (
        <Pressable onPress={() => router.back()} style={{ paddingVertical: 6 }}>
          <Text style={{ color: theme.colors.text, fontWeight: "700" }}>← Indietro</Text>
        </Pressable>
      ) : null}

      <Text style={{ fontSize: 26, fontWeight: "900", color: theme.colors.text }}>
        {title}
      </Text>

      {subtitle ? (
        <Text style={{ color: theme.colors.subtext }}>{subtitle}</Text>
      ) : null}
    </View>
  );
}