import React from 'react';
import { Platform } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';

function ClassicTabLayout() {
  const colors = useColors();
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Path',
          tabBarIcon: ({ color }) => {
            const tint = String(color ?? '');
            return isIOS ? (
              <SymbolView name="map.fill" tintColor={tint} size={22} />
            ) : (
              <Feather name="map" size={22} color={tint} />
            );
          },
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => {
            const tint = String(color ?? '');
            return isIOS ? (
              <SymbolView name="chart.bar.fill" tintColor={tint} size={22} />
            ) : (
              <Feather name="bar-chart-2" size={22} color={tint} />
            );
          },
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  // Standard tabs work across the installed Expo version and the declared
  // upgrade target; do not import version-specific native-tab entry points.
  return <ClassicTabLayout />;
}
