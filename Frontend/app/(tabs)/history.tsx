import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Text,
  Surface,
  useTheme,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { getMeasurements } from '../../api/client';
import { medicalColors } from '../../theme';
import type { Measurement } from '../../store/useAppStore';
import type { MD3Theme } from 'react-native-paper';

/**
 * Ekran Historii — lista ostatnich pomiarów ciśnienia i tętna.
 *
 * Każdy wpis wyświetla:
 * - wartości SYS/DIA/Puls
 * - datę pomiaru
 * - oznaczenie anomalii (jeśli dotyczy)
 * - kolorowy status (norma / podwyższone / wysokie)
 */
export default function HistoryScreen() {
  const theme = useTheme<MD3Theme>();
  const user = useAppStore((s) => s.user);
  const measurements = useAppStore((s) => s.measurements);
  const setMeasurements = useAppStore((s) => s.setMeasurements);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      setLoading(true);
      getMeasurements(user.id)
        .then(setMeasurements)
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [user?.id])
  );

  const getStatusColor = (sys: number, dia: number) => {
    if (sys < 120 && dia < 80) return medicalColors.normal;
    if (sys < 140 && dia < 90) return medicalColors.warning;
    return medicalColors.danger;
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const renderItem = ({ item }: { item: Measurement }) => {
    const statusColor = getStatusColor(item.systolic, item.diastolic);

    return (
      <Surface style={[styles.card, { backgroundColor: theme.colors.elevation.level1 }]} elevation={1}>
        {/* Pasek statusu z lewej */}
        <View style={[styles.statusBar, { backgroundColor: statusColor }]} />

        <View style={styles.cardContent}>
          {/* Wiersz wartości */}
          <View style={styles.valuesRow}>
            <View style={styles.valueGroup}>
              <Text variant="headlineSmall" style={[styles.valueText, { color: theme.colors.onSurface }]}>
                {item.systolic}/{item.diastolic}
              </Text>
              <Text variant="bodySmall" style={styles.valueLabel}>mmHg</Text>
            </View>
            <Divider style={styles.verticalDivider} />
            <View style={styles.valueGroup}>
              <Text variant="headlineSmall" style={[styles.valueText, { color: theme.colors.onSurface }]}>
                {item.pulse}
              </Text>
              <Text variant="bodySmall" style={styles.valueLabel}>BPM</Text>
            </View>
          </View>

          {/* Data i anomalia */}
          <View style={styles.bottomRow}>
            <View style={styles.dateRow}>
              <MaterialCommunityIcons name="calendar-clock" size={16} color={theme.colors.outline} />
              <Text variant="bodySmall" style={{ color: theme.colors.outline, marginLeft: 4 }}>
                {formatDate(item.createdAt)}
              </Text>
            </View>

            {item.isAnomaly && (
              <View style={[styles.anomalyBadge, { backgroundColor: medicalColors.danger + '20' }]}>
                <MaterialCommunityIcons name="alert" size={16} color={medicalColors.danger} />
                <Text style={[styles.anomalyText, { color: medicalColors.danger }]}>
                  Anomalia
                </Text>
              </View>
            )}
          </View>
        </View>
      </Surface>
    );
  };

  const styles = makeStyles(theme);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" style={{ marginTop: 12, color: theme.colors.onSurfaceVariant }}>
          Ładowanie pomiarów…
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {measurements.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="clipboard-text-off-outline" size={64} color={theme.colors.outline} />
          <Text variant="titleMedium" style={{ color: theme.colors.outline, marginTop: 12, textAlign: 'center' }}>
            Brak pomiarów.{'\n'}Dodaj pierwszy pomiar na Pulpicie.
          </Text>
        </View>
      ) : (
        <FlatList
          data={measurements}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </View>
  );
}

const makeStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    list: {
      padding: 16,
      paddingBottom: 32,
    },
    card: {
      borderRadius: 16,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    statusBar: {
      width: 6,
    },
    cardContent: {
      flex: 1,
      padding: 16,
    },
    valuesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
    },
    valueGroup: {
      alignItems: 'center',
    },
    valueText: {
      fontWeight: '700',
    },
    valueLabel: {
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    verticalDivider: {
      width: 1,
      height: 36,
      backgroundColor: theme.colors.outline,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    anomalyBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    anomalyText: {
      fontSize: 13,
      fontWeight: '600',
    },
  });
