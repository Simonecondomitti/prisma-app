import React from "react";
import { View } from "react-native";
import { theme } from "./theme";

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.l,
        backgroundColor: theme.colors.card,
        gap: 6,
      }}
    >
      {children}
    </View>
  );
}