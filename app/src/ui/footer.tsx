import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { theme } from "./theme";

type Variant = "client" | "pt";

export function AppFooterTabBar({
  state,
  descriptors,
  navigation,
  variant,
}: BottomTabBarProps & { variant: Variant }) {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> =
    variant === "pt"
      ? { home: "home", exercises: "barbell", students: "people-outline", profile: "person" }
      : { home: "home", exercises: "barbell", profile: "person" };
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
      {state.routes.map((route, index) => {
        // ✅ nascondi automaticamente eventuali route non tab
        if (!iconMap[route.name]) return null;

        const focused = state.index === index;
        const options = descriptors[route.key]?.options ?? {};

        const label =
          typeof options.tabBarLabel === "string"
            ? options.tabBarLabel
            : typeof options.title === "string"
            ? options.title
            : route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            // ✅ questo mantiene history e back corretto
            navigation.navigate(route.name as never);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={{ flex: 1, alignItems: "center", paddingVertical: 10 }}
          >
            <Ionicons
              name={iconMap[route.name]}
              size={20}
              color={focused ? theme.colors.text : theme.colors.subtext}
            />
            <Text
              style={{
                color: focused ? theme.colors.text : theme.colors.subtext,
                fontSize: 12,
                marginTop: 4,
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}