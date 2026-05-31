import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Animated as RNAnimated,
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
import { parseVoiceText, saveMeasurement, getMeasurements, getHealthTip } from '../../api/client';
import { medicalColors } from '../../theme';
import { useVoiceInput } from '../../hooks/useVoiceInput';
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
  const addOfflineMeasurement = useAppStore((s) => s.addOfflineMeasurement);
  const healthTip = useAppStore((s) => s.healthTip);
  const setHealthTip = useAppStore((s) => s.setHealthTip);

  const [isSaving, setIsSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Wartości formularza dodawania pomiaru
  const [addSys, setAddSys] = useState('');
  const [addDia, setAddDia] = useState('');
  const [addPulse, setAddPulse] = useState('');

  // Stan asystenta AI
  const [aiText, setAiText] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);

  // Hook rozpoznawania mowy (STT)
  const { isListening, transcript, startListening, stopListening } = useVoiceInput();

  // Pulsująca animacja przycisku mikrofonu
  const micPulseAnim = useRef(new RNAnimated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      const pulse = RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(micPulseAnim, { toValue: 1.25, duration: 500, useNativeDriver: true }),
          RNAnimated.timing(micPulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      micPulseAnim.setValue(1);
    }
  }, [isListening]);

  // Synchronizacja transkrypcji STT z polem tekstowym AI
  useEffect(() => {
    if (transcript) {
      setAiText(transcript);
    }
  }, [transcript]);

  const lastMeasurement = measurements.length > 0 ? measurements[0] : null;

  // Odśwież pomiary i poradę przy każdym wejściu na ekran
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        getMeasurements(user.id)
          .then(setMeasurements)
          .catch(() => {});

        getHealthTip(user.id)
          .then(setHealthTip)
          .catch(() => {});
      }
    }, [user?.id])
  );

  const handleRefreshTip = async () => {
    if (!user?.id) return;
    try {
      const newTip = await getHealthTip(user.id);
      setHealthTip(newTip);
    } catch (e) {
      Alert.alert('Błąd', 'Nie udało się odświeżyć porady.');
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
        Dodaj pomiar ręcznie lub za pomocą asystenta głosowego AI
      </Text>

      {/* ————— PRZYCISK DODAJ WYNIK ————— */}
      <Button
        mode="contained"
        icon={({ size, color }) => (
          <MaterialCommunityIcons name="plus" size={28} color={color} />
        )}
        onPress={() => {
          setAddSys('');
          setAddDia('');
          setAddPulse('');
          setAiText('');
          setShowAddDialog(true);
        }}
        style={styles.addButton}
        contentStyle={styles.addButtonContent}
        labelStyle={styles.addButtonLabel}
        elevation={2}
      >
        Dodaj wynik
      </Button>

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

      {/* ————— PODSUMOWANIE STATYSTYK ————— */}
      {measurements.length >= 2 && (() => {
        const avgSys = Math.round(measurements.reduce((s, m) => s + m.systolic, 0) / measurements.length);
        const avgDia = Math.round(measurements.reduce((s, m) => s + m.diastolic, 0) / measurements.length);
        const avgPulse = Math.round(measurements.reduce((s, m) => s + m.pulse, 0) / measurements.length);
        const anomalyCount = measurements.filter((m) => m.isAnomaly).length;
        const statusInfo = getStatusInfo(avgSys, avgDia);

        return (
          <Surface style={styles.summaryCard} elevation={1}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Podsumowanie ({measurements.length} pomiarów)
            </Text>
            <Divider style={{ marginVertical: 8 }} />

            <View style={styles.metricsRow}>
              <View style={styles.metricBox}>
                <Text variant="bodySmall" style={styles.metricLabel}>Śr. SYS</Text>
                <Text variant="headlineSmall" style={[styles.metricValue, { color: statusInfo.color }]}>
                  {avgSys}
                </Text>
              </View>
              <View style={styles.metricBox}>
                <Text variant="bodySmall" style={styles.metricLabel}>Śr. DIA</Text>
                <Text variant="headlineSmall" style={[styles.metricValue, { color: statusInfo.color }]}>
                  {avgDia}
                </Text>
              </View>
              <View style={styles.metricBox}>
                <Text variant="bodySmall" style={styles.metricLabel}>Śr. Puls</Text>
                <Text variant="headlineSmall" style={styles.metricValue}>
                  {avgPulse}
                </Text>
              </View>
            </View>

            {anomalyCount > 0 && (
              <View style={[styles.statusBadge, { backgroundColor: medicalColors.danger + '20' }]}>
                <MaterialCommunityIcons name="alert" size={18} color={medicalColors.danger} />
                <Text style={[styles.statusText, { color: medicalColors.danger }]}>
                  Anomalie: {anomalyCount}
                </Text>
              </View>
            )}
          </Surface>
        );
      })()}

      {/* ————— PORADA AI (RAG) ————— */}
      {healthTip && (
        <Surface style={styles.aiTipCard} elevation={1}>
          <View style={styles.aiTipHeader}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color={medicalColors.warning} />
            <Text variant="titleMedium" style={styles.cardTitle}>
              Porada AI
            </Text>
            <View style={{ flex: 1 }} />
            <IconButton
              icon="refresh"
              size={20}
              onPress={handleRefreshTip}
              iconColor={theme.colors.primary}
            />
          </View>
          <Text variant="bodyMedium" style={styles.aiTipText}>
            {healthTip.tip}
          </Text>
          <Text variant="labelSmall" style={styles.aiTipDate}>
            Wygenerowano: {new Date(healthTip.generatedAt).toLocaleString()}
          </Text>
        </Surface>
      )}

      {/* ————— DIALOG DODAWANIA WYNIKU (FORMULARZ + AI) ————— */}
      <Portal>
        <Dialog
          visible={showAddDialog}
          onDismiss={() => {
            if (!isSaving && !isAiParsing) {
              setShowAddDialog(false);
            }
          }}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Nowy pomiar</Dialog.Title>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
          >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 420 }}
          >
          <Dialog.Content style={{ gap: 12 }}>
            
            {/* Formularz Ręczny */}
            <Text variant="titleSmall" style={styles.sectionHeader}>
              Wprowadź wartości ręcznie:
            </Text>
            <View style={styles.formRow}>
              <TextInput
                label="SYS (skurczowe)"
                value={addSys}
                onChangeText={setAddSys}
                keyboardType="numeric"
                mode="outlined"
                left={<TextInput.Icon icon="heart" color={theme.colors.primary} />}
                style={styles.formInput}
              />
              <TextInput
                label="DIA (rozkurczowe)"
                value={addDia}
                onChangeText={setAddDia}
                keyboardType="numeric"
                mode="outlined"
                left={<TextInput.Icon icon="heart-outline" color={theme.colors.secondary} />}
                style={styles.formInput}
              />
            </View>
            <TextInput
              label="Puls (tętno)"
              value={addPulse}
              onChangeText={setAddPulse}
              keyboardType="numeric"
              mode="outlined"
              left={<TextInput.Icon icon="heart-pulse" color={medicalColors.danger} />}
              style={styles.fullFormInput}
            />

            <Divider style={{ marginVertical: 8 }} />

            {/* Asystent Głosowy / AI */}
            <Text variant="titleSmall" style={styles.sectionHeader}>
              🎤 Użyj asystenta AI (mowa / tekst):
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Wpisz np. „moje ciśnienie to 125 na 82, puls 68", a AI samo uzupełni pola wyżej!
            </Text>
            
            <View style={styles.aiInputContainer}>
              <View style={styles.aiInputRow}>
                <TextInput
                  placeholder="Wpisz lub powiedz pomiar..."
                  value={aiText}
                  onChangeText={setAiText}
                  mode="outlined"
                  multiline
                  numberOfLines={2}
                  style={[styles.aiTextInput, { flex: 1 }]}
                />
                {/* Przycisk mikrofonu STT */}
                <RNAnimated.View style={{ transform: [{ scale: micPulseAnim }] }}>
                  <IconButton
                    icon={isListening ? 'microphone' : 'microphone-outline'}
                    mode={isListening ? 'contained' : 'contained-tonal'}
                    size={28}
                    iconColor={isListening ? theme.colors.onPrimary : theme.colors.primary}
                    containerColor={isListening ? theme.colors.primary : theme.colors.primaryContainer}
                    onPress={() => {
                      try {
                        if (isListening) {
                          stopListening();
                        } else {
                          startListening();
                        }
                      } catch {
                        Alert.alert(
                          'Mikrofon niedostępny',
                          'Rozpoznawanie mowy wymaga Development Build (npx expo run:android). W Expo Go wpisz tekst ręcznie.'
                        );
                      }
                    }}
                    accessibilityLabel={isListening ? 'Zatrzymaj nagrywanie' : 'Rozpocznij nagrywanie głosu'}
                    style={styles.micButton}
                  />
                </RNAnimated.View>
              </View>
              {isListening && (
                <Text variant="bodySmall" style={{ color: theme.colors.primary, fontStyle: 'italic' }}>
                  🎙️ Słucham… mów teraz
                </Text>
              )}
              <Button
                mode="contained-tonal"
                icon="send"
                loading={isAiParsing}
                disabled={isAiParsing || !aiText.trim()}
                onPress={async () => {
                  if (!aiText.trim()) {
                    Alert.alert('Brak tekstu', 'Wpisz tekst, aby AI mogło go przeanalizować.');
                    return;
                  }
                  setIsAiParsing(true);
                  try {
                    const parsed = await parseVoiceText(aiText.trim());
                    setAddSys(String(parsed.systolic));
                    setAddDia(String(parsed.diastolic));
                    setAddPulse(String(parsed.pulse));
                    Alert.alert('Sukces AI', 'Pola formularza zostały automatycznie uzupełnione!');
                  } catch (e: any) {
                    Alert.alert(
                      'Błąd AI',
                      e?.response?.data?.message || 'Nie udało się przeanalizować tekstu.'
                    );
                  } finally {
                    setIsAiParsing(false);
                  }
                }}
                style={styles.aiSendButton}
              >
                {isAiParsing ? 'Wysyłanie do AI...' : 'Wyślij do AI'}
              </Button>
            </View>

          </Dialog.Content>
          </ScrollView>
          </KeyboardAvoidingView>
          <Dialog.Actions>
            <Button
              onPress={() => setShowAddDialog(false)}
              disabled={isSaving || isAiParsing}
            >
              Anuluj
            </Button>
            <Button
              mode="contained"
              onPress={async () => {
                const sys = parseInt(addSys, 10);
                const dia = parseInt(addDia, 10);
                const pulse = parseInt(addPulse, 10);

                if (isNaN(sys) || isNaN(dia) || isNaN(pulse)) {
                  Alert.alert('Błąd', 'Uzupełnij wszystkie pola poprawnymi liczbami (SYS, DIA, Puls). Może w tym pomóc asystent AI.');
                  return;
                }

                if (!user?.id) return;

                setIsSaving(true);
                try {
                  const saved = await saveMeasurement(user.id, {
                    systolic: sys,
                    diastolic: dia,
                    pulse: pulse,
                  });

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
                  setShowAddDialog(false);
                } catch (e: any) {
                  // Brak odpowiedzi serwera = problem sieciowy → zapis offline
                  if (!e?.response) {
                    addOfflineMeasurement(user.id, {
                      systolic: sys,
                      diastolic: dia,
                      pulse: pulse,
                    });
                    Alert.alert(
                      '📴 Zapisano offline',
                      'Brak połączenia z serwerem. Pomiar został zapisany lokalnie i zostanie zsynchronizowany po przywróceniu połączenia.'
                    );
                    setShowAddDialog(false);
                  } else {
                    Alert.alert('Błąd zapisu', 'Nie udało się zapisać pomiaru.');
                  }
                } finally {
                  setIsSaving(false);
                }
              }}
              loading={isSaving}
              disabled={isSaving || isAiParsing}
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
    addButton: {
      borderRadius: 28,
      paddingHorizontal: 8,
      marginBottom: 32,
      width: '100%',
    },
    addButtonContent: {
      flexDirection: 'row',
      height: 56,
    },
    addButtonLabel: {
      fontSize: 18,
      fontWeight: '700',
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
    aiTipCard: {
      marginHorizontal: 16,
      marginBottom: 20,
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.colors.elevation.level1,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    aiTipHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    aiTipText: {
      fontStyle: 'italic',
      lineHeight: 22,
      color: theme.colors.onSurfaceVariant,
    },
    aiTipDate: {
      marginTop: 12,
      textAlign: 'right',
      color: theme.colors.outline,
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
    summaryCard: {
      width: '100%',
      borderRadius: 20,
      padding: 20,
      marginTop: 16,
      backgroundColor: theme.colors.elevation.level1,
    },
    dialog: {
      borderRadius: 24,
    },
    dialogTitle: {
      fontWeight: 'bold',
      textAlign: 'center',
    },
    sectionHeader: {
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginTop: 4,
    },
    formRow: {
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
    },
    formInput: {
      flex: 1,
      fontSize: 16,
    },
    fullFormInput: {
      width: '100%',
      fontSize: 16,
    },
    aiInputContainer: {
      flexDirection: 'column',
      gap: 10,
      marginTop: 6,
    },
    aiInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    aiTextInput: {
      flex: 1,
      fontSize: 16,
    },
    micButton: {
      marginTop: 4,
    },
    aiSendButton: {
      borderRadius: 20,
      alignSelf: 'flex-end',
      marginTop: 4,
    },
  });
