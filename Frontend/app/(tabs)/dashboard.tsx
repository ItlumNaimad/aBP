import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import {
  Text,
  Surface,
  useTheme,
  Button,
  Portal,
  Dialog,
  TextInput,
  ActivityIndicator,
  Divider,
  IconButton,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { parseVoiceText, saveMeasurement, getMeasurements } from '../../api/client';
import { medicalColors } from '../../theme';
import type { MD3Theme } from 'react-native-paper';

/**
 * Dashboard — Główny ekran aplikacji.
 *
 * Komponenty:
 *  - Wielki przycisk mikrofonu (rozpoczyna przechwytywanie mowy)
 *  - Karty podsumowania ostatniego pomiaru
 *  - Dialog potwierdzenia z wartościami AI + możliwość ręcznej edycji
 */
export default function DashboardScreen() {
  const theme = useTheme<MD3Theme>();
  const user = useAppStore((s) => s.user);
  const measurements = useAppStore((s) => s.measurements);
  const setMeasurements = useAppStore((s) => s.setMeasurements);
  const pendingParsed = useAppStore((s) => s.pendingParsed);
  const setPendingParsed = useAppStore((s) => s.setPendingParsed);

  const [isListening, setIsListening] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Edytowalne wartości w dialogu potwierdzenia
  const [editSys, setEditSys] = useState('');
  const [editDia, setEditDia] = useState('');
  const [editPulse, setEditPulse] = useState('');

  // Pole ręcznego wpisywania tekstu (zastępstwo mikrofonu do testów)
  const [manualText, setManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const lastMeasurement = measurements.length > 0 ? measurements[0] : null;

  // Odśwież pomiary przy każdym wejściu na ekran
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        getMeasurements(user.id)
          .then(setMeasurements)
          .catch(() => {});
      }
    }, [user?.id])
  );

  /**
   * Obsługa nasłuchiwania mowy.
   * Na razie: dialog do wklejenia tekstu (moduł @react-native-voice/voice
   * wymaga Development Build — zostanie dodany po konfiguracji prebuild).
   */
  const handleMicPress = () => {
    setShowManualInput(true);
  };

  const handleSendVoiceText = async (text: string) => {
    if (!text.trim()) return;

    setIsListening(true);
    setShowManualInput(false);

    try {
      const parsed = await parseVoiceText(text.trim());
      setPendingParsed(parsed);
      setEditSys(String(parsed.systolic));
      setEditDia(String(parsed.diastolic));
      setEditPulse(String(parsed.pulse));
      setShowConfirmDialog(true);
    } catch (e: any) {
      Alert.alert(
        'Błąd parsowania',
        e?.response?.data?.message || 'Nie udało się przetworzyć tekstu. Spróbuj ponownie.'
      );
    } finally {
      setIsListening(false);
      setManualText('');
    }
  };

  const handleConfirmSave = async () => {
    if (!user?.id) return;

    const sys = parseInt(editSys, 10);
    const dia = parseInt(editDia, 10);
    const pulse = parseInt(editPulse, 10);

    if (isNaN(sys) || isNaN(dia) || isNaN(pulse)) {
      Alert.alert('Błąd', 'Wszystkie pola muszą być liczbami.');
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveMeasurement(user.id, {
        systolic: sys,
        diastolic: dia,
        pulse: pulse,
      });

      // Jeśli wykryto anomalię — pokaż ostrzeżenie
      if (saved.isAnomaly) {
        Alert.alert(
          '⚠️ Wykryto anomalię',
          'Twoje wartości ciśnienia znacząco odbiegają od normy. Skonsultuj się z lekarzem.',
          [{ text: 'Rozumiem', style: 'default' }]
        );
      } else {
        Alert.alert('✅ Zapisano', 'Pomiar został zapisany pomyślnie.');
      }

      // Odśwież listę pomiarów
      const refreshed = await getMeasurements(user.id);
      setMeasurements(refreshed);
      setPendingParsed(null);
    } catch (e: any) {
      Alert.alert('Błąd zapisu', 'Nie udało się zapisać pomiaru.');
    } finally {
      setIsSaving(false);
      setShowConfirmDialog(false);
    }
  };

  /**
   * Określ kolor i etykietę pomiaru wg norm medycznych
   */
  const getStatusInfo = (sys: number, dia: number) => {
    if (sys < 120 && dia < 80)
      return { color: medicalColors.normal, label: 'Norma', icon: 'check-circle' as const };
    if (sys < 140 && dia < 90)
      return { color: medicalColors.warning, label: 'Podwyższone', icon: 'alert-circle' as const };
    return { color: medicalColors.danger, label: 'Wysokie', icon: 'alert-octagon' as const };
  };

  const styles = makeStyles(theme);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Powitanie */}
      <Text variant="headlineMedium" style={styles.greeting}>
        Witaj, {user?.username || 'Użytkowniku'} 👋
      </Text>
      <Text variant="bodyLarge" style={styles.greetingSub}>
        Powiedz swój wynik ciśnienia lub wpisz ręcznie
      </Text>

      {/* ————— WIELKI PRZYCISK MIKROFONU ————— */}
      <Pressable onPress={handleMicPress} disabled={isListening}>
        <Surface
          style={[
            styles.micButton,
            {
              backgroundColor: isListening
                ? theme.colors.error
                : theme.colors.primary,
            },
          ]}
          elevation={4}
        >
          {isListening ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <MaterialCommunityIcons name="microphone" size={72} color="#FFFFFF" />
          )}
        </Surface>
      </Pressable>
      <Text variant="titleMedium" style={styles.micLabel}>
        {isListening ? 'Analizuję…' : 'Naciśnij aby mówić'}
      </Text>

      {/* ————— OSTATNI POMIAR ————— */}
      {lastMeasurement && (
        <Surface style={styles.lastCard} elevation={1}>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Ostatni pomiar
          </Text>
          <Divider style={{ marginVertical: 8 }} />

          <View style={styles.metricsRow}>
            {/* Ciśnienie skurczowe */}
            <View style={styles.metricBox}>
              <MaterialCommunityIcons name="heart" size={28} color={theme.colors.primary} />
              <Text variant="headlineSmall" style={styles.metricValue}>
                {lastMeasurement.systolic}
              </Text>
              <Text variant="bodySmall" style={styles.metricLabel}>Skurczowe</Text>
            </View>

            <Text variant="headlineMedium" style={styles.slash}>/</Text>

            {/* Ciśnienie rozkurczowe */}
            <View style={styles.metricBox}>
              <MaterialCommunityIcons name="heart-outline" size={28} color={theme.colors.secondary} />
              <Text variant="headlineSmall" style={styles.metricValue}>
                {lastMeasurement.diastolic}
              </Text>
              <Text variant="bodySmall" style={styles.metricLabel}>Rozkurczowe</Text>
            </View>

            {/* Tętno */}
            <View style={styles.metricBox}>
              <MaterialCommunityIcons name="heart-pulse" size={28} color={medicalColors.danger} />
              <Text variant="headlineSmall" style={styles.metricValue}>
                {lastMeasurement.pulse}
              </Text>
              <Text variant="bodySmall" style={styles.metricLabel}>Tętno</Text>
            </View>
          </View>

          {/* Status */}
          {(() => {
            const status = getStatusInfo(lastMeasurement.systolic, lastMeasurement.diastolic);
            return (
              <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                <MaterialCommunityIcons name={status.icon} size={22} color={status.color} />
                <Text style={[styles.statusText, { color: status.color }]}>
                  {status.label}
                </Text>
              </View>
            );
          })()}

          {lastMeasurement.isAnomaly && (
            <View style={[styles.statusBadge, { backgroundColor: medicalColors.danger + '20', marginTop: 6 }]}>
              <MaterialCommunityIcons name="alert" size={22} color={medicalColors.danger} />
              <Text style={[styles.statusText, { color: medicalColors.danger }]}>
                ⚠ Anomalia wykryta — skonsultuj z lekarzem
              </Text>
            </View>
          )}
        </Surface>
      )}

      {!lastMeasurement && (
        <Surface style={styles.emptyCard} elevation={1}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={theme.colors.outline} />
          <Text variant="bodyLarge" style={styles.emptyText}>
            Brak pomiarów. Naciśnij mikrofon, aby dodać pierwszy pomiar.
          </Text>
        </Surface>
      )}

      {/* ————— DIALOG RĘCZNEGO WPISYWANIA TEKSTU ————— */}
      <Portal>
        <Dialog
          visible={showManualInput}
          onDismiss={() => setShowManualInput(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Wpisz tekst do analizy</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 12, color: theme.colors.onSurfaceVariant }}>
              Wpisz to, co powiedziałbyś na głos, np.:{'\n'}
              „Mam ciśnienie 135 na 85, puls 72"
            </Text>
            <TextInput
              label="Twój tekst"
              value={manualText}
              onChangeText={setManualText}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={{ fontSize: 17 }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowManualInput(false)}>Anuluj</Button>
            <Button
              mode="contained"
              onPress={() => handleSendVoiceText(manualText)}
              disabled={!manualText.trim()}
              icon="send"
            >
              Wyślij do AI
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* ————— DIALOG POTWIERDZENIA WYNIKÓW (edytowalny) ————— */}
      <Portal>
        <Dialog
          visible={showConfirmDialog}
          onDismiss={() => setShowConfirmDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Potwierdź wyniki pomiaru</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 16, color: theme.colors.onSurfaceVariant }}>
              AI przeanalizowało Twój tekst. Sprawdź wartości i popraw, jeśli trzeba:
            </Text>
            <TextInput
              label="Ciśnienie skurczowe (SYS)"
              value={editSys}
              onChangeText={setEditSys}
              keyboardType="numeric"
              mode="outlined"
              left={<TextInput.Icon icon="heart" />}
              style={styles.confirmInput}
            />
            <TextInput
              label="Ciśnienie rozkurczowe (DIA)"
              value={editDia}
              onChangeText={setEditDia}
              keyboardType="numeric"
              mode="outlined"
              left={<TextInput.Icon icon="heart-outline" />}
              style={styles.confirmInput}
            />
            <TextInput
              label="Tętno (puls)"
              value={editPulse}
              onChangeText={setEditPulse}
              keyboardType="numeric"
              mode="outlined"
              left={<TextInput.Icon icon="heart-pulse" />}
              style={styles.confirmInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowConfirmDialog(false)}>Anuluj</Button>
            <Button
              mode="contained"
              onPress={handleConfirmSave}
              loading={isSaving}
              disabled={isSaving}
              icon="content-save"
            >
              Zapisz pomiar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
      alignItems: 'center',
    },
    greeting: {
      fontWeight: '700',
      color: theme.colors.onBackground,
      alignSelf: 'flex-start',
      marginBottom: 4,
    },
    greetingSub: {
      color: theme.colors.onSurfaceVariant,
      alignSelf: 'flex-start',
      marginBottom: 28,
    },
    micButton: {
      width: 160,
      height: 160,
      borderRadius: 80,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    micLabel: {
      color: theme.colors.onSurfaceVariant,
      marginBottom: 28,
      fontWeight: '600',
    },
    lastCard: {
      width: '100%',
      borderRadius: 20,
      padding: 20,
      backgroundColor: theme.colors.elevation.level1,
    },
    cardTitle: {
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    metricsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      marginVertical: 8,
    },
    metricBox: {
      alignItems: 'center',
      minWidth: 70,
    },
    metricValue: {
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginTop: 4,
    },
    metricLabel: {
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    slash: {
      color: theme.colors.outline,
      marginHorizontal: 4,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginTop: 12,
      gap: 6,
    },
    statusText: {
      fontWeight: '600',
      fontSize: 15,
    },
    emptyCard: {
      width: '100%',
      borderRadius: 20,
      padding: 32,
      alignItems: 'center',
      backgroundColor: theme.colors.elevation.level1,
      gap: 12,
    },
    emptyText: {
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
    },
    dialog: {
      borderRadius: 24,
    },
    confirmInput: {
      marginBottom: 10,
      fontSize: 18,
    },
  });
