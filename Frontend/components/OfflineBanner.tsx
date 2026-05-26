import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { MD3Theme } from 'react-native-paper';

/**
 * Banner wyświetlany na górze ekranu gdy aplikacja nie ma połączenia z backendem.
 *
 * Funkcjonalność:
 * - Czerwony/pomarańczowy pasek z ikoną i informacją "Tryb offline"
 * - Wyświetla liczbę pomiarów oczekujących w kolejce synchronizacji
 * - Automatycznie znika gdy połączenie zostanie przywrócone (kontrolowane przez rodzica)
 *
 * @param pendingCount — liczba pomiarów w kolejce offline oczekujących na synchronizację
 */
interface OfflineBannerProps {
  pendingCount: number;
}

export default function OfflineBanner({ pendingCount }: OfflineBannerProps) {
  const theme = useTheme<MD3Theme>();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.error }]}>
      <MaterialCommunityIcons name="wifi-off" size={18} color={theme.colors.onError} />
      <Text variant="bodySmall" style={[styles.text, { color: theme.colors.onError }]}>
        Tryb offline — brak połączenia z serwerem
      </Text>
      {pendingCount > 0 && (
        <View style={[styles.badge, { backgroundColor: theme.colors.onError }]}>
          <Text variant="labelSmall" style={{ color: theme.colors.error, fontWeight: '700' }}>
            {pendingCount}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  text: {
    fontWeight: '600',
    fontSize: 13,
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
});
