import React from "react";
import { Pressable, Text, View } from "react-native";
import { theme } from "./theme";

type Props = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  right?: string; // es: "4 esercizi"
};

export function RowLink({ title, subtitle, onPress, right }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.l,
          backgroundColor: theme.colors.card,
          flexDirection: "row",
          justifyContent: "space-between",
          gap: theme.spacing.l,
        }}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: theme.colors.text }}>
            {title}
          </Text>
          {subtitle ? <Text style={{ color: theme.colors.subtext }}>{subtitle}</Text> : null}
        </View>

        {right ? (
          <Text style={{ color: theme.colors.subtext, fontWeight: "700" }}>
            {right} →
          </Text>
        ) : (
          <Text style={{ color: theme.colors.subtext, fontWeight: "700" }}>→</Text>
        )}
      </View>
    </Pressable>
  );
}