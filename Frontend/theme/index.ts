import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

/**
 * Konfiguracja czcionek: bazowy rozmiar powiększony dla czytelności seniorów.
 * Material Design 3 definiuje warianty, tutaj nadpisujemy rozmiary na większe.
 */
const fontConfig = {
  displayLarge:  { fontSize: 57, lineHeight: 64, fontWeight: '400' as const },
  displayMedium: { fontSize: 45, lineHeight: 52, fontWeight: '400' as const },
  displaySmall:  { fontSize: 36, lineHeight: 44, fontWeight: '400' as const },
  headlineLarge: { fontSize: 34, lineHeight: 42, fontWeight: '400' as const },
  headlineMedium:{ fontSize: 30, lineHeight: 38, fontWeight: '400' as const },
  headlineSmall: { fontSize: 26, lineHeight: 34, fontWeight: '400' as const },
  titleLarge:    { fontSize: 24, lineHeight: 30, fontWeight: '500' as const },
  titleMedium:   { fontSize: 20, lineHeight: 26, fontWeight: '500' as const },
  titleSmall:    { fontSize: 17, lineHeight: 23, fontWeight: '500' as const },
  bodyLarge:     { fontSize: 18, lineHeight: 26, fontWeight: '400' as const },
  bodyMedium:    { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodySmall:     { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  labelLarge:    { fontSize: 16, lineHeight: 22, fontWeight: '500' as const },
  labelMedium:   { fontSize: 14, lineHeight: 18, fontWeight: '500' as const },
  labelSmall:    { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
};

/**
 * Paleta kolorów medycznych — teal/cyan jako kolor wiodący,
 * przygotowany pod kontrast WCAG AA (4.5:1 dla tekstu).
 */
const medicalColors = {
  // Kolory statusu pomiarów
  normal: '#2E7D32',       // Zielony — pomiar w normie
  warning: '#F57F17',      // Pomarańczowy — lekkie odchylenie
  danger: '#C62828',       // Czerwony — anomalia/wykryta nieprawidłowość
  // Dodatkowe    
  cardBorder: '#B2EBF2',
};

export const LightTheme: MD3Theme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: '#00838F',             // Teal 800
    onPrimary: '#FFFFFF',
    primaryContainer: '#B2EBF2',    // Teal 100
    onPrimaryContainer: '#004D56',
    secondary: '#4A6572',           // Ciemny błękitno-szary
    onSecondary: '#FFFFFF',
    secondaryContainer: '#CFD8DC',
    onSecondaryContainer: '#1B3A4B',
    tertiary: '#7B1FA2',            // Fioletowy akcent
    surface: '#FAFFFE',
    onSurface: '#1A1C1E',
    surfaceVariant: '#E0F2F1',
    onSurfaceVariant: '#3F4947',
    background: '#F5FDFC',
    onBackground: '#1A1C1E',
    error: '#BA1A1A',
    onError: '#FFFFFF',
    outline: '#6F7977',
    elevation: {
      level0: 'transparent',
      level1: '#EFF8F6',
      level2: '#E6F4F2',
      level3: '#DCF0ED',
      level4: '#DAEEED',
      level5: '#D3EBE9',
    },
  },
};

export const DarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#4DD0E1',             // Teal 300
    onPrimary: '#00363D',
    primaryContainer: '#004F58',
    onPrimaryContainer: '#B2EBF2',
    secondary: '#B0BEC5',
    onSecondary: '#1B3A4B',
    secondaryContainer: '#37474F',
    onSecondaryContainer: '#CFD8DC',
    tertiary: '#CE93D8',
    surface: '#121A1C',
    onSurface: '#E1E3E0',
    surfaceVariant: '#3F4947',
    onSurfaceVariant: '#BFC9C5',
    background: '#0E1415',
    onBackground: '#E1E3E0',
    error: '#FFB4AB',
    onError: '#690005',
    outline: '#89938F',
    elevation: {
      level0: 'transparent',
      level1: '#1A2426',
      level2: '#1F2C2F',
      level3: '#243437',
      level4: '#263639',
      level5: '#2A3C3F',
    },
  },
};

export { medicalColors };
