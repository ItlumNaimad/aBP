import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/client';

/**
 * Hook monitorujący dostępność połączenia z backendem.
 *
 * Strategia wykrywania:
 * Zamiast korzystać z zewnętrznej biblioteki (np. @react-native-community/netinfo),
 * hook wykonuje lekkie zapytanie HEAD do backendu co `intervalMs` milisekund.
 * Dzięki temu wykrywamy nie tylko brak internetu, ale też niedostępność samego serwera.
 *
 * @param intervalMs — interwał sprawdzania w ms (domyślnie 15s)
 * @returns {{ isOnline: boolean, checkNow: () => void }}
 *
 * @example
 * ```tsx
 * const { isOnline, checkNow } = useNetworkStatus();
 * if (!isOnline) showOfflineBanner();
 * ```
 */
export function useNetworkStatus(intervalMs: number = 15000) {
  const [isOnline, setIsOnline] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Wykonuje lekkie zapytanie do backendu (timeout 5s).
   * Jeśli odpowiedź przyjdzie — ustawiamy isOnline=true.
   * Jeśli wyjątek (timeout, brak sieci) — isOnline=false.
   */
  const checkConnection = useCallback(async () => {
    try {
      await api.get('/api/users/login', { timeout: 5000 });
      // Endpoint zwróci 4xx/5xx ale to nie problem — odpowiedział, czyli serwer żyje
      setIsOnline(true);
    } catch (error: any) {
      // Jeśli dostaliśmy odpowiedź HTTP (nawet 4xx/5xx) — serwer jest dostępny
      if (error?.response) {
        setIsOnline(true);
      } else {
        // Brak odpowiedzi = brak sieci lub serwer nie odpowiada
        setIsOnline(false);
      }
    }
  }, []);

  useEffect(() => {
    // Sprawdź natychmiast przy montowaniu
    checkConnection();

    // Ustaw cykliczne sprawdzanie
    intervalRef.current = setInterval(checkConnection, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkConnection, intervalMs]);

  return { isOnline, checkNow: checkConnection };
}
