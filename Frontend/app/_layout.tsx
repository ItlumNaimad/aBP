import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { LightTheme, DarkTheme } from '../theme';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import OfflineBanner from '../components/OfflineBanner';

/**
 * Główny layout aplikacji.
 *
 * Odpowiada za:
 * - Dostawcę motywu (PaperProvider) z persystencją jasny/ciemny
 * - SafeAreaProvider dla bezpiecznych marginesów ekranu
 * - Ładowanie preferencji motywu i kolejki offline przy starcie
 * - Wyświetlanie bannera „Offline" gdy backend jest niedostępny
 * - Nawigację stosu (Stack) bez nagłówków
 */
function RootLayoutContent() {
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const loadThemePreference = useAppStore((s) => s.loadThemePreference);
  const loadOfflineQueue = useAppStore((s) => s.loadOfflineQueue);
  const pendingOfflineMeasurements = useAppStore((s) => s.pendingOfflineMeasurements);

  const { isOnline } = useNetworkStatus();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadThemePreference();
    loadOfflineQueue();
  }, []);

  const theme = isDarkMode ? DarkTheme : LightTheme;

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      {/* Banner Offline — widoczny na samej górze, pod status barem */}
      {!isOnline && (
        <View style={{ paddingTop: insets.top, backgroundColor: theme.colors.error }}>
          <OfflineBanner pendingCount={pendingOfflineMeasurements.length} />
        </View>
      )}
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootLayoutContent />
    </SafeAreaProvider>
  );
}
