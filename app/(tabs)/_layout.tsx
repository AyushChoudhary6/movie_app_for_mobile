import { images } from "@/constants/images";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { ImageBackground, StyleSheet } from "react-native";

/* ---------------- TAB ICON ---------------- */

const TabIcon = ({ focused, iconName }) => {
  if (!focused) {
    // INACTIVE TAB
    return (
      <Ionicons
        name={iconName}
        size={24}
        color="#9CA3AF" // gray
      />
    );
  }

  // ACTIVE TAB
  return (
    <ImageBackground
      source={images.highlight}
      style={styles.activeTab}
      imageStyle={styles.activeTabImage}
    >
      <Ionicons
        name={iconName}
        size={24}
        color="#151312"
      />
    </ImageBackground>
  );
};

/* ---------------- TABS LAYOUT ---------------- */

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        header: () => null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} iconName="home" />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} iconName="search" />
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} iconName="bookmark" />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} iconName="person" />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  tabBar: {
    height: 85,
    borderTopWidth: 0,
    elevation: 0,
    backgroundColor: "#0f0D23",
    borderRadius: 35,
    // marginHorizontal: 20,
    // marginBottom: 16,
    paddingTop: 13,
    position: "absolute",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#151312",
  },
  activeTab: {
    width: 100,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    
  },
  activeTabImage: {
    borderRadius: 35,
    
  },
});
