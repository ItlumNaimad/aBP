import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import type { MD3Theme } from 'react-native-paper';

/**
 * Layout nawigacji dolnej z zakładkami (tabs).
 *
 * Trzy karty:
 * 1. Dashboard — główny ekran z przyciskiem mikrofonu
 * 2. Historia  — lista ostatnich pomiarów
 * 3. Ustawienia — przełącznik motywu, eksport PDF, wylogowanie
 */
export default function TabsLayout() {
  const theme = useTheme<MD3Theme>();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.elevation.level2,
          height: 64,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 22,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.elevation.level2,
          borderTopColor: theme.colors.outline,
          borderTopWidth: 0.5,
          height: 72,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Pulpit',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="heart-pulse" color={color} size={30} />
          ),
          tabBarLabel: 'Pulpit',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historia',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-text-clock" color={color} size={30} />
          ),
          tabBarLabel: 'Historia',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ustawienia',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={30} />
          ),
          tabBarLabel: 'Ustawienia',
        }}
      />
    </Tabs>
  );
}
