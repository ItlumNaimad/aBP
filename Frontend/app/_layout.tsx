import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { LightTheme, DarkTheme } from '../theme';

/**
 * Główny Layout (_layout.tsx)
 *
 * Opakowuje całą aplikację w:
 * - SafeAreaProvider (bezpieczne marginesy urządzenia)
 * - PaperProvider (motyw Material Design 3)
 * - Stack Navigator (nawigacja między ekranami)
 */
export default function RootLayout() {
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const loadThemePreference = useAppStore((s) => s.loadThemePreference);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const theme = isDarkMode ? DarkTheme : LightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
