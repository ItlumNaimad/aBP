import { useState, useEffect, useCallback } from 'react';
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
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = useCallback(async () => {
    try {
      setTranscript('');
      setIsListening(true);
      // Rozpoczęcie nasłuchu w języku polskim
      await Voice.start('pl-PL');
    } catch (e) {
      console.error('Failed to start voice recognition:', e);
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error('Failed to stop voice recognition:', e);
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
