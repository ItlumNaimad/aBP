import { useState, useEffect, useCallback } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';

/**
 * Abstrakcyjny hook opakowujący logikę wprowadzania głosowego.
 *
 * Obecna implementacja: natywne rozpoznawanie mowy przy użyciu @react-native-voice/voice.
 * Wymaga Development Build (EAS Build / npx expo run:android) z racji natywnych bibliotek mikrofonu.
 *
 * Interfejs hooka jest stabilny — zmiana implementacji pod spodem
 * nie wymaga zmian w komponentach.
 */

interface UseVoiceInputReturn {
  /** Czy aktualnie trwa nasłuchiwanie / przetwarzanie */
  isListening: boolean;
  /** Przechwycony tekst (do wysłania do API) */
  transcript: string;
  /** Flaga, czy dostępne jest prawdziwe STT (w Development Build: true) */
  isNativeSTTAvailable: boolean;
  /** Rozpocznij nasłuchiwanie za pomocą mikrofonu systemowego */
  startListening: () => void;
  /** Zatrzymaj nasłuchiwanie */
  stopListening: () => void;
  /** Ustaw tekst ręcznie (np. jako fallback) */
  setManualTranscript: (text: string) => void;
  /** Wyczyść transkrypcję */
  clearTranscript: () => void;
}

export function useVoiceInput(): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  // W Development Build natywne rozpoznawanie mowy jest w pełni dostępne
  const isNativeSTTAvailable = true;

  useEffect(() => {
    function onSpeechStart() {
      setIsListening(true);
    }

    function onSpeechEnd() {
      setIsListening(false);
    }

    function onSpeechResults(e: SpeechResultsEvent) {
      if (e.value && e.value.length > 0) {
        // Pierwsza fraza na liście jest najbardziej dopasowana/prawdopodobna
        setTranscript(e.value[0]);
      }
    }

    function onSpeechError(e: SpeechErrorEvent) {
      console.error('Speech recognition error: ', e.error);
      setIsListening(false);
    }

    // Rejestracja listenerów systemowych
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    // Czyszczenie zasobów przy odmontowywaniu hooka
    return () => {
      try {
        if (Voice && (Voice as any)._voice) {
          Voice.destroy().then(Voice.removeAllListeners).catch(() => {});
        }
      } catch (e) {
        // Ignoruj błąd przy niszczeniu
      }
    };
  }, []);

  const startListening = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Uprawnienie do mikrofonu',
            message: 'Aplikacja potrzebuje dostępu do mikrofonu, aby rozpoznawać polecenia głosowe.',
            buttonNeutral: 'Później',
            buttonNegative: 'Anuluj',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error('Odmówiono dostępu do mikrofonu.');
        }
      }

      setTranscript('');
      setIsListening(true);
      // Rozpoczęcie nasłuchu w języku polskim
      if (Voice && (Voice as any)._voice) { // weryfikacja natywnego modułu
        await Voice.start('pl-PL');
      } else {
        // Fallback w razie braku native module - symulujemy odrzucenie, żeby złapał to przycisk w UI
        throw new Error('Natywny moduł rozpoznawania mowy nie został skompilowany. Przebuduj aplikację komendą npx expo prebuild.');
      }
    } catch (e) {
      console.error('Failed to start voice recognition:', e);
      setIsListening(false);
      throw e;
    }
  }, []);

  const stopListening = useCallback(async () => {
    try {
      if (Voice && (Voice as any)._voice) {
        await Voice.stop();
      }
      setIsListening(false);
    } catch (e) {
      console.error('Failed to stop voice recognition:', e);
      setIsListening(false);
    }
  }, []);

  const setManualTranscript = useCallback((text: string) => {
    setTranscript(text);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    isNativeSTTAvailable,
    startListening,
    stopListening,
    setManualTranscript,
    clearTranscript,
  };
}
