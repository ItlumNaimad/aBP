import { useState, useCallback } from 'react';

/**
 * Abstrakcyjny hook opakowujący logikę wprowadzania głosowego.
 *
 * Obecna implementacja: deleguje do ręcznego wpisania tekstu (dialog).
 * Przyszła implementacja: podpięcie @react-native-voice/voice
 * po konfiguracji Development Build (npx expo prebuild).
 *
 * Interfejs hooka jest stabilny — zmiana implementacji pod spodem
 * nie wymaga zmian w komponentach.
 */

interface UseVoiceInputReturn {
  /** Czy aktualnie trwa nasłuchiwanie / przetwarzanie */
  isListening: boolean;
  /** Przechwycony tekst (do wysłania do API) */
  transcript: string;
  /** Flaga, czy dostępne jest prawdziwe STT (na razie false) */
  isNativeSTTAvailable: boolean;
  /** Rozpocznij nasłuchiwanie (w przyszłości: uruchom mikrofon) */
  startListening: () => void;
  /** Zatrzymaj nasłuchiwanie */
  stopListening: () => void;
  /** Ustaw tekst ręcznie (zastępstwo za mikrofon) */
  setManualTranscript: (text: string) => void;
  /** Wyczyść transkrypcję */
  clearTranscript: () => void;
}

export function useVoiceInput(): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Na razie: brak natywnego STT — Expo Go nie wspiera @react-native-voice/voice
  const isNativeSTTAvailable = false;

  const startListening = useCallback(() => {
    if (isNativeSTTAvailable) {
      // TODO: Podpięcie @react-native-voice/voice w Development Build
      // Voice.start('pl-PL');
      setIsListening(true);
    }
    // W trybie fallback: nic nie robimy — komponent otworzy dialog ręczny
  }, [isNativeSTTAvailable]);

  const stopListening = useCallback(() => {
    if (isNativeSTTAvailable) {
      // TODO: Voice.stop();
    }
    setIsListening(false);
  }, [isNativeSTTAvailable]);

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
