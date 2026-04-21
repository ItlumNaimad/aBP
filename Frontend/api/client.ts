import axios from 'axios';
import { Platform } from 'react-native';
import type { AppUser, Measurement, ParsedMeasurement } from '../store/useAppStore';

/**
 * Bazowy adres serwera backendowego.
 * 
 * Android Emulator: 10.0.2.2 mapuje na localhost hosta.
 * Fizyczny telefon w tej samej sieci: użyj IP hosta WSL (np. 192.168.x.x).
 * Web: localhost działa bezpośrednio.
 */
const getBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080';
  }
  // Web lub iOS — domyślnie localhost
  return 'http://localhost:8080';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ——————————————————————————————————————
// Endpointy użytkownika
// ——————————————————————————————————————

/** Zaloguj lub utwórz konto na podstawie nazwy użytkownika */
export const loginUser = async (username: string): Promise<AppUser> => {
  const { data } = await api.post<AppUser>('/api/users/login', { username });
  return data;
};

// ——————————————————————————————————————
// Endpointy głosowe (Gemini AI)
// ——————————————————————————————————————

/** Wyślij przechwycony tekst mowy do backendu → Gemini parsuje na wartości ciśnienia */
export const parseVoiceText = async (text: string): Promise<ParsedMeasurement> => {
  const { data } = await api.post<ParsedMeasurement>('/api/voice/parse', { text });
  return data;
};

// ——————————————————————————————————————
// Endpointy pomiarów
// ——————————————————————————————————————

/** Pobierz ostatnie 10 pomiarów użytkownika */
export const getMeasurements = async (userId: string): Promise<Measurement[]> => {
  const { data } = await api.get<Measurement[]>(`/api/measurements/${userId}`);
  return data;
};

/** Zapisz nowy pomiar ciśnienia i tętna */
export const saveMeasurement = async (
  userId: string,
  parsed: ParsedMeasurement
): Promise<Measurement> => {
  const { data } = await api.post<Measurement>(`/api/measurements/${userId}`, parsed);
  return data;
};

// ——————————————————————————————————————
// Endpointy raportów PDF
// ——————————————————————————————————————

/** Pobierz raport PDF jako Blob */
export const downloadReport = async (userId: string): Promise<Blob> => {
  const response = await api.get(`/api/reports/${userId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

export default api;
