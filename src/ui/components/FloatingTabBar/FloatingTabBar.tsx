/**
 * FloatingTabBar
 *
 * Tab bar flotante tipo pill con iconos outline, animaciones y tema.
 */

import Feather from "@expo/vector-icons/Feather";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BottomTabBarHeightCallbackContext } from "@react-navigation/bottom-tabs";
import { getLabel } from "@react-navigation/elements";
import { CommonActions } from "@react-navigation/native";
import React, { useCallback, useContext, useEffect } from "react";
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../ThemeProvider";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

const ROUTE_ICONS: Record<string, FeatherIconName> = {
  index: "home",
  profile: "user",
};

const springConfig = { damping: 15, stiffness: 150 };

function TabItem({
  route,
  label,
  isFocused,
  onPress,
  onLongPress,
  activeColor,
  inactiveColor,
}: {
  route: { name: string; key: string };
  label: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  activeColor: string;
  inactiveColor: string;
}) {
  const scale = useSharedValue(1);
  const iconColor = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    iconColor.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused, iconColor]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + iconColor.value * 0.5,
    transform: [{ scale: 0.9 + iconColor.value * 0.1 }],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.92, springConfig);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springConfig);
  }, [scale]);

  const color = isFocused ? activeColor : inactiveColor;
  const iconName = ROUTE_ICONS[route.name] ?? "circle";

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ flex: 1 }}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
    >
      <Animated.View
        style={[
          {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 10,
            gap: 4,
          },
          animatedContainerStyle,
        ]}
      >
        <Animated.View style={animatedIconStyle}>
          <Feather
            name={iconName}
            size={22}
            color={color}
            strokeWidth={isFocused ? 2.5 : 2}
          />
        </Animated.View>
        <Text
          style={{
            fontSize: 11,
            fontWeight: isFocused ? "600" : "500",
            color,
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function FloatingTabBar({
  state,
  navigation,
  descriptors,
  insets,
}: BottomTabBarProps) {
  const { theme } = useTheme();
  const { colors, spacing, borders, shadows } = theme;
  const safe = useSafeAreaInsets();
  const onHeightChange = useContext(BottomTabBarHeightCallbackContext);

  const bottomInset = Math.max(insets?.bottom ?? 0, safe.bottom);
  const horizontalPadding = Math.max(
    insets?.left ?? 0,
    insets?.right ?? 0,
    safe.left,
    safe.right,
    spacing.lg,
  );

  const activeColor = colors.primary;
  const inactiveColor = colors.text.tertiary;

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { height } = e.nativeEvent.layout;
      onHeightChange?.(height);
    },
    [onHeightChange],
  );

  const isDark = theme.mode === "dark";
  const pillBg = isDark ? colors.background.secondary : "#ffffff";
  const pillShadow = isDark
    ? {
        shadowColor: "#000",
        shadowOpacity: 0.35,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      }
    : {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      };

  return (
    <View
      onLayout={handleLayout}
      style={{
        paddingBottom: bottomInset,
        paddingTop: spacing.sm,
        backgroundColor: "transparent",
        alignItems: "center",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          backgroundColor: pillBg,
          minHeight: 56,
          width: "100%",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: colors.border.light,
          ...(Platform.OS === "android" && { elevation: shadows.elevation.md }),
          ...pillShadow,
        }}
      >
        {state.routes.map((route, index) => {
          const focused = index === state.index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.dispatch({
                ...CommonActions.navigate(route),
                target: state.key,
              });
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          const label =
            typeof options.tabBarLabel === "function"
              ? (options.title ?? route.name)
              : getLabel(
                  { label: options.tabBarLabel, title: options.title },
                  route.name,
                );

          return (
            <TabItem
              key={route.key}
              route={route}
              label={typeof label === "string" ? label : route.name}
              isFocused={focused}
              onPress={onPress}
              onLongPress={onLongPress}
              activeColor={activeColor}
              inactiveColor={inactiveColor}
            />
          );
        })}
      </View>
    </View>
  );
}
