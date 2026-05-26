import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import {
  Text,
  Surface,
  useTheme,
  Switch,
  List,
  Divider,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { savePdfToDevice, saveMeasurement, getMeasurements } from '../../api/client';
import type { MD3Theme } from 'react-native-paper';

/**
 * Ekran Ustawień:
 * - Przełącznik motywu jasny/ciemny
 * - Sekcja synchronizacji offline (liczba oczekujących + przycisk sync)
 * - Pobieranie raportu PDF
 * - Wylogowanie
 */
export default function SettingsScreen() {
  const theme = useTheme<MD3Theme>();
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const pendingOfflineMeasurements = useAppStore((s) => s.pendingOfflineMeasurements);
  const removeOfflineMeasurement = useAppStore((s) => s.removeOfflineMeasurement);
  const setMeasurements = useAppStore((s) => s.setMeasurements);

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * Ręczna synchronizacja kolejki offline z backendem.
   *
   * Iteruje po wszystkich oczekujących pomiarach i próbuje zapisać je na serwerze.
   * Pomiary pomyślnie zsynchronizowane są usuwane z kolejki.
   * Jeśli backend nadal jest niedostępny, pomiary pozostają w kolejce.
   */
  const handleSyncOffline = async () => {
    if (!user?.id || pendingOfflineMeasurements.length === 0) return;

    setIsSyncing(true);
    let synced = 0;
    let failed = 0;

    for (const item of pendingOfflineMeasurements) {
      try {
        await saveMeasurement(item.userId, item.parsed);
        removeOfflineMeasurement(item.localId);
        synced++;
      } catch {
        failed++;
      }
    }

    // Odśwież listę pomiarów po synchronizacji
    if (synced > 0) {
      try {
        const refreshed = await getMeasurements(user.id);
        setMeasurements(refreshed);
      } catch {
        // Ignoruj — pomiary i tak zostały zapisane
      }
    }

    setIsSyncing(false);

    if (failed === 0) {
      Alert.alert('✅ Synchronizacja zakończona', `Zsynchronizowano ${synced} pomiar(ów).`);
    } else {
      Alert.alert(
        '⚠️ Częściowa synchronizacja',
        `Zsynchronizowano: ${synced}, nieudane: ${failed}. Spróbuj ponownie później.`
      );
    }
  };

  const handleDownloadPdf = async () => {
    if (!user?.id) return;

    setDownloadingPdf(true);
    try {
      await savePdfToDevice(user.id);
      Alert.alert('✅ Gotowe', 'Raport PDF został pobrany i udostępniony.');
    } catch (e: any) {
      Alert.alert(
        'Błąd',
        'Nie udało się pobrać raportu. Upewnij się, że masz zapisane pomiary.'
      );
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Wylogowanie',
      'Czy na pewno chcesz się wylogować?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Wyloguj',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const styles = makeStyles(theme);
  const pendingCount = pendingOfflineMeasurements.length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Informacje o użytkowniku */}
      <Surface style={styles.userCard} elevation={1}>
        <View style={styles.userAvatar}>
          <MaterialCommunityIcons name="account-circle" size={56} color={theme.colors.primary} />
        </View>
        <Text variant="titleLarge" style={styles.username}>
          {user?.username || 'Nieznany'}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
          ID: {user?.id?.slice(0, 8) || '—'}…
        </Text>
      </Surface>

      {/* Ustawienia */}
      <Surface style={styles.section} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Wygląd</Text>
        <Divider />

        <List.Item
          title="Tryb ciemny"
          description={isDarkMode ? 'Włączony' : 'Wyłączony'}
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDesc}
          left={(props) => (
            <List.Icon {...props} icon={isDarkMode ? 'weather-night' : 'white-balance-sunny'} />
          )}
          right={() => (
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              color={theme.colors.primary}
            />
          )}
          style={styles.listItem}
        />
      </Surface>

      {/* Synchronizacja offline */}
      <Surface style={styles.section} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Synchronizacja</Text>
        <Divider />

        <List.Item
          title="Pomiary oczekujące"
          description={
            pendingCount > 0
              ? `${pendingCount} pomiar(ów) w kolejce offline`
              : 'Brak oczekujących pomiarów'
          }
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDesc}
          left={(props) => (
            <List.Icon
              {...props}
              icon={pendingCount > 0 ? 'cloud-upload' : 'cloud-check'}
              color={pendingCount > 0 ? theme.colors.error : theme.colors.primary}
            />
          )}
          right={() =>
            pendingCount > 0 ? (
              isSyncing ? (
                <ActivityIndicator size="small" />
              ) : (
                <Button
                  mode="contained-tonal"
                  compact
                  onPress={handleSyncOffline}
                  icon="sync"
                  labelStyle={{ fontSize: 12 }}
                >
                  Synchronizuj
                </Button>
              )
            ) : null
          }
          style={styles.listItem}
        />
      </Surface>

      {/* Raporty */}
      <Surface style={styles.section} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Raporty</Text>
        <Divider />

        <List.Item
          title="Pobierz raport PDF"
          description="Generuje raport z ostatnich pomiarów"
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDesc}
          left={(props) => <List.Icon {...props} icon="file-pdf-box" />}
          right={() =>
            downloadingPdf ? (
              <ActivityIndicator size="small" />
            ) : (
              <MaterialCommunityIcons
                name="download"
                size={24}
                color={theme.colors.primary}
              />
            )
          }
          onPress={handleDownloadPdf}
          disabled={downloadingPdf}
          style={styles.listItem}
        />
      </Surface>

      {/* Wylogowanie */}
      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
        contentStyle={styles.logoutContent}
        labelStyle={styles.logoutLabel}
        icon="logout"
        textColor={theme.colors.error}
      >
        Wyloguj się
      </Button>

      <Text variant="bodySmall" style={styles.version}>
        aBP Monitor Ciśnienia v1.0.0
      </Text>
    </ScrollView>
  );
}

const makeStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    userCard: {
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
      marginBottom: 16,
      backgroundColor: theme.colors.elevation.level1,
    },
    userAvatar: {
      marginBottom: 8,
    },
    username: {
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    section: {
      borderRadius: 16,
      marginBottom: 16,
      overflow: 'hidden',
      backgroundColor: theme.colors.elevation.level1,
    },
    sectionTitle: {
      fontWeight: '700',
      color: theme.colors.onSurface,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    listItem: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      minHeight: 64,
    },
    listTitle: {
      fontSize: 17,
      fontWeight: '500',
    },
    listDesc: {
      fontSize: 14,
    },
    logoutButton: {
      marginTop: 8,
      borderRadius: 16,
      borderColor: theme.colors.error,
    },
    logoutContent: {
      paddingVertical: 10,
    },
    logoutLabel: {
      fontSize: 17,
      fontWeight: '600',
    },
    version: {
      textAlign: 'center',
      color: theme.colors.outline,
      marginTop: 24,
    },
  });
