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
import { downloadReport } from '../../api/client';
import type { MD3Theme } from 'react-native-paper';

/**
 * Ekran Ustawień:
 * - Przełącznik motywu jasny/ciemny
 * - Pobieranie raportu PDF
 * - Wylogowanie
 */
export default function SettingsScreen() {
  const theme = useTheme<MD3Theme>();
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);

  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!user?.id) return;

    setDownloadingPdf(true);
    try {
      await downloadReport(user.id);
      Alert.alert('✅ Gotowe', 'Raport PDF został pobrany pomyślnie.');
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
