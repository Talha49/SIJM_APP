import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />

      {/* Task Tab */}
      <Tabs.Screen
        name="Fields"
        options={{
          title: 'Fields',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="tasks" size={size} color={color} />
          ),
        }}
      />

      {/* Inspector Tab */}
      <Tabs.Screen
        name="Inspector"
        options={{
          title: 'Inspector',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="eye" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}