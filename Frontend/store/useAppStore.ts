import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Typ danych użytkownika zwracany z backendu */
export interface AppUser {
  id: string;
  username: string;
}

/** Sparsowany wynik pomiaru z Gemini AI */
export interface ParsedMeasurement {
  systolic: number;
  diastolic: number;
  pulse: number;
}

/** Pełny pomiar z bazy danych */
export interface Measurement {
  id: string;
  userId: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  isAnomaly: boolean;
  createdAt: string;
}

/**
 * Pomiar oczekujący w kolejce offline.
 *
 * Przechowywany w AsyncStorage gdy backend jest niedostępny.
 * Pole `localId` to unikalne ID generowane po stronie klienta,
 * służące do identyfikacji pomiaru w kolejce przed synchronizacją.
 */
export interface OfflineMeasurement {
  localId: string;
  userId: string;
  parsed: ParsedMeasurement;
  createdAt: string;
}

/**
 * Porada zdrowotna wygenerowana przez Gemini AI
 * na podstawie historii pomiarów pacjenta (RAG).
 */
export interface HealthTip {
  tip: string;
  generatedAt: string;
}

interface AppState {
  // ——— Motyw ———
  isDarkMode: boolean;
  toggleTheme: () => void;
  loadThemePreference: () => Promise<void>;

  // ——— Użytkownik ———
  user: AppUser | null;
  setUser: (user: AppUser) => void;
  logout: () => void;

  // ——— Pomiary ———
  measurements: Measurement[];
  setMeasurements: (m: Measurement[]) => void;

  // ——— Tymczasowy parsing (wynik z Gemini do zatwierdzenia) ———
  pendingParsed: ParsedMeasurement | null;
  setPendingParsed: (p: ParsedMeasurement | null) => void;

  // ——— Kolejka offline ———
  /** Lista pomiarów zapisanych lokalnie, oczekujących na synchronizację z backendem */
  pendingOfflineMeasurements: OfflineMeasurement[];
  /**
   * Dodaje pomiar do kolejki offline i utrwala ją w AsyncStorage.
   * Wywoływane gdy zapis do backendu nie powiódł się (brak sieci).
   */
  addOfflineMeasurement: (userId: string, parsed: ParsedMeasurement) => void;
  /**
   * Usuwa pomiar z kolejki offline po pomyślnej synchronizacji.
   * @param localId — identyfikator lokalny pomiaru do usunięcia
   */
  removeOfflineMeasurement: (localId: string) => void;
  /** Czyści całą kolejkę offline (po pełnej synchronizacji) */
  clearOfflineQueue: () => void;
  /** Ładuje kolejkę offline z AsyncStorage przy starcie aplikacji */
  loadOfflineQueue: () => Promise<void>;

  // ——— Porada AI (RAG) ———
  /** Ostatnio wygenerowana porada zdrowotna z AI Gemini */
  healthTip: HealthTip | null;
  setHealthTip: (tip: HealthTip | null) => void;
}

const THEME_KEY = '@abp_dark_mode';
const OFFLINE_QUEUE_KEY = '@abp_offline_queue';

export const useAppStore = create<AppState>((set, get) => ({
  // ——— Motyw ———
  isDarkMode: false,

  toggleTheme: () => {
    const next = !get().isDarkMode;
    set({ isDarkMode: next });
    AsyncStorage.setItem(THEME_KEY, JSON.stringify(next)).catch(() => {});
  },

  loadThemePreference: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      if (stored !== null) {
        set({ isDarkMode: JSON.parse(stored) });
      }
    } catch {
      // Pierwsza instalacja — domyślnie jasny motyw
    }
  },

  // ——— Użytkownik ———
  user: null,
  setUser: (user: AppUser) => set({ user }),
  logout: () => {
    set({ user: null, measurements: [], pendingParsed: null, healthTip: null });
    AsyncStorage.removeItem('@abp_user').catch(() => {});
  },

  // ——— Pomiary ———
  measurements: [],
  setMeasurements: (measurements: Measurement[]) => set({ measurements }),

  // ——— Tymczasowy parsing ———
  pendingParsed: null,
  setPendingParsed: (pendingParsed: ParsedMeasurement | null) => set({ pendingParsed }),

  // ——— Kolejka offline ———
  pendingOfflineMeasurements: [],

  addOfflineMeasurement: (userId: string, parsed: ParsedMeasurement) => {
    const newItem: OfflineMeasurement = {
      localId: `offline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId,
      parsed,
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().pendingOfflineMeasurements, newItem];
    set({ pendingOfflineMeasurements: updated });
    AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated)).catch(() => {});
  },

  removeOfflineMeasurement: (localId: string) => {
    const updated = get().pendingOfflineMeasurements.filter((m) => m.localId !== localId);
    set({ pendingOfflineMeasurements: updated });
    AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated)).catch(() => {});
  },

  clearOfflineQueue: () => {
    set({ pendingOfflineMeasurements: [] });
    AsyncStorage.removeItem(OFFLINE_QUEUE_KEY).catch(() => {});
  },

  loadOfflineQueue: async () => {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (stored !== null) {
        set({ pendingOfflineMeasurements: JSON.parse(stored) });
      }
    } catch {
      // Brak kolejki offline — czysta instalacja
    }
  },

  // ——— Porada AI (RAG) ———
  healthTip: null,
  setHealthTip: (healthTip: HealthTip | null) => set({ healthTip }),
}));
