import axios from 'axios';
import { Platform } from 'react-native';
import type { AppUser, Measurement, ParsedMeasurement, HealthTip } from '../store/useAppStore';

/**
 * Bazowy adres serwera backendowego.
 * 
 * Strategia wykrywania:
 * - Android Emulator: 10.0.2.2 mapuje na localhost hosta.
 * - Fizyczny telefon w tej samej sieci: użyj IP hosta WSL (np. 192.168.x.x).
 * - Web: localhost działa bezpośrednio.
 *
 * W przypadku użycia localtunnel, adres jest podmieniony na publiczny HTTPS.
 */
const getBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    return 'https://cold-bats-marry.loca.lt';
  }
  // Web lub iOS — domyślnie localhost
  return 'http://localhost:8080';
};

/**
 * Instancja klienta Axios z domyślną konfiguracją:
 * - baseURL dobierany dynamicznie na podstawie platformy
 * - timeout 15s chroni przed zawieszonym UI przy braku sieci
 * - nagłówek Bypass-Tunnel-Reminder omija ekran ostrzegawczy localtunnel
 */
const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
  },
});

// ——————————————————————————————————————
// Endpointy użytkownika
// ——————————————————————————————————————

/**
 * Zaloguj lub utwórz konto na podstawie nazwy użytkownika.
 *
 * Backend stosuje model "Login or Create": jeśli użytkownik istnieje
 * w bazie, zwraca jego UUID; jeśli nie — tworzy nowy rekord w locie.
 *
 * @param username — nazwa użytkownika wpisana na ekranie logowania
 * @returns AppUser — obiekt z id (UUID) i username
 */
export const loginUser = async (username: string): Promise<AppUser> => {
  const { data } = await api.post<AppUser>('/api/users/login', { username });
  return data;
};

// ——————————————————————————————————————
// Endpointy głosowe (Gemini AI)
// ——————————————————————————————————————

/**
 * Wyślij przechwycony tekst mowy do backendu.
 *
 * Backend przekazuje tekst do modelu Gemini, który parsuje go
 * na ustrukturyzowany obiekt {systolic, diastolic, pulse}.
 *
 * @param text — tekst rozpoznany z mowy lub wpisany ręcznie
 * @returns ParsedMeasurement — sparsowane wartości ciśnienia i tętna
 */
export const parseVoiceText = async (text: string): Promise<ParsedMeasurement> => {
  const { data } = await api.post<ParsedMeasurement>('/api/voice/parse', { text });
  return data;
};

// ——————————————————————————————————————
// Endpointy pomiarów
// ——————————————————————————————————————

/**
 * Pobierz ostatnie 10 pomiarów użytkownika.
 *
 * Backend zwraca Flow<Measurement> (strumień R2DBC), który WebFlux
 * serializuje do tablicy JSON dla klienta HTTP.
 *
 * @param userId — UUID zalogowanego użytkownika
 * @returns Measurement[] — tablica pomiarów posortowana malejąco po dacie
 */
export const getMeasurements = async (userId: string): Promise<Measurement[]> => {
  const { data } = await api.get<Measurement[]>(`/api/measurements/${userId}`);
  return data;
};

/**
 * Zapisz nowy pomiar ciśnienia i tętna.
 *
 * Backend automatycznie wykrywa anomalie medyczne (progi WHO + odchylenia
 * od średniej pacjenta) i ustawia flagę isAnomaly w odpowiedzi.
 *
 * @param userId — UUID zalogowanego użytkownika
 * @param parsed — sparsowane wartości {systolic, diastolic, pulse}
 * @returns Measurement — zapisany pomiar z wygenerowanym ID, datą i flagą anomalii
 */
export const saveMeasurement = async (
  userId: string,
  parsed: ParsedMeasurement
): Promise<Measurement> => {
  const { data } = await api.post<Measurement>(`/api/measurements/${userId}`, parsed);
  return data;
};

// ——————————————————————————————————————
// Endpointy AI (porady zdrowotne RAG)
// ——————————————————————————————————————

/**
 * Pobierz spersonalizowaną poradę zdrowotną wygenerowaną przez AI.
 *
 * Backend stosuje wzorzec RAG (Retrieval-Augmented Generation):
 * 1. Pobiera historię ostatnich 10 pomiarów pacjenta z bazy.
 * 2. Buduje kontekstowy prompt z danymi medycznymi.
 * 3. Wysyła do modelu Gemini, który generuje poradę po polsku.
 *
 * @param userId — UUID zalogowanego użytkownika
 * @returns HealthTip — obiekt z treścią porady i znacznikiem czasu
 */
export const getHealthTip = async (userId: string): Promise<HealthTip> => {
  const { data } = await api.get<HealthTip>(`/api/ai/health-tips/${userId}`);
  return data;
};

// ——————————————————————————————————————
// Endpointy raportów PDF
// ——————————————————————————————————————

/**
 * Pobierz raport PDF jako ArrayBuffer (kompatybilne z React Native).
 *
 * Backend generuje PDF w Dispatchers.IO (pula wątków blokujących),
 * zwracając ByteArray z nagłówkiem Content-Type: application/pdf.
 *
 * @param userId — UUID zalogowanego użytkownika
 * @returns ArrayBuffer — surowe dane binarne pliku PDF
 */
export const downloadReport = async (userId: string): Promise<ArrayBuffer> => {
  const response = await api.get(`/api/reports/${userId}/download`, {
    responseType: 'arraybuffer',
  });
  return response.data;
};

// ——————————————————————————————————————
// Zapis PDF na urządzenie (expo-file-system + expo-sharing)
// ——————————————————————————————————————

import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Pobierz PDF z backendu i otwórz natywny dialog udostępniania/zapisu.
 *
 * Proces (expo-file-system v19 — nowe API):
 * 1. Pobranie ArrayBuffer z API
 * 2. Zapis do pliku w Paths.cache za pomocą klasy File
 * 3. Otwarcie natywnego dialogu Sharing
 *
 * @param userId — UUID zalogowanego użytkownika
 */
export const savePdfToDevice = async (userId: string): Promise<void> => {
  const arrayBuffer = await downloadReport(userId);

  // Nazwa pliku z datą
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const fileName = `raport_cisnienia_${dateStr}.pdf`;

  // expo-file-system v19: Zapis za pomocą klasy File
  const file = new File(Paths.cache, fileName);
  const bytes = new Uint8Array(arrayBuffer);
  file.write(bytes);

  // Natywny dialog udostępniania / zapisu
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Zapisz raport ciśnienia',
      UTI: 'com.adobe.pdf',
    });
  }
};

export default api;
