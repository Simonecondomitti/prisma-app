import React from "react";
import { ScrollView, View } from "react-native";
import { theme } from "./theme";

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ padding: theme.spacing.xl, gap: theme.spacing.m }}>
        {children}
      </View>
    </ScrollView>
  );
}