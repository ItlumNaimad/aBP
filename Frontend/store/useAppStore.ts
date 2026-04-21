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
}

const THEME_KEY = '@abp_dark_mode';

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
    set({ user: null, measurements: [], pendingParsed: null });
    AsyncStorage.removeItem('@abp_user').catch(() => {});
  },

  // ——— Pomiary ———
  measurements: [],
  setMeasurements: (measurements: Measurement[]) => set({ measurements }),

  // ——— Tymczasowy parsing ———
  pendingParsed: null,
  setPendingParsed: (pendingParsed: ParsedMeasurement | null) => set({ pendingParsed }),
}));
