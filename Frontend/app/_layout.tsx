import React, { useEffect } from 'react';
import { Platform, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { LightTheme, DarkTheme } from '../theme';

function RootLayoutContent() {
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

export default function RootLayout() {
  if (Platform.OS === 'web') {
    const { WithSkiaWeb } = require('@shopify/react-native-skia/lib/module/web');
    return (
      <WithSkiaWeb 
        getComponent={() => RootLayoutContent} 
        fallback={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Ładowanie silnika wykresów...</Text>
          </View>
        } 
      />
    );
  }

  return <RootLayoutContent />;
}
