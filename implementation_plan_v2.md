# Plan Testowania Aplikacji aBP

Dokument opisujący sposób uruchomienia i testowania aplikacji w trzech trybach: **Web**, **Expo Go na telefonie** i **Backend**, a także plan wdrożenia testów automatycznych (Faza 6).

## Status Sprawdzenia

| Element | Status | Uwagi |
|---|---|---|
| TypeScript (tsc --noEmit) | ✅ 0 błędów | Kompilacja czysta |
| Metro Bundler start | ✅ Działa | Port 8081, Web + QR |
| Web bundle (2204 modules) | ✅ Skompilowany | 10.8s |
| HTTP Response localhost:8081 | ✅ 200 OK | Serwuje stronę |
| victory-native na web | ⚠️ Ograniczone | Wymaga obsługi, patrz niżej |

## 1. Uruchomienie Web (localhost)

> [!TIP]
> Tryb Web działa natychmiast — bez telefonu, bez emulatora. Idealny do szybkiego testowania UI.

```bash
# Wyczyść cache + uruchom
cd Frontend && npx expo start -c --web

# Lub w jednym kroku:
cd Frontend && npx expo start -c -w
```

Aplikacja będzie dostępna pod: **http://localhost:8081**

### ⚠️ Znany problem: Wykresy na Web

`victory-native` + `@shopify/react-native-skia` **nie działają domyślnie na platformie Web** w pełni. Istnieją dwa rozwiązania:

#### Rozwiązanie A: Skia Web Setup (rekomendowane)

`@shopify/react-native-skia` wspiera Web przez WebAssembly (CanvasKit), ale wymaga dodatkowej konfiguracji:

```bash
# Skopiuj canvaskit.wasm do publicznego katalogu
npx setup-skia-web
```

Oraz w `_layout.tsx` lub ładowaniu aplikacji należy dodać asynchroniczne ładowanie Skia:

```tsx
import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

// Komponent z wykresem musi być ładowany leniwie
```

#### Rozwiązanie B: Warunkowy import (prostsze)

Stworzyć wrapper `BloodPressureChart` z warunkowym renderowaniem na web — np. pokazujący tabelę zamiast wykresu:

```tsx
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // Pokazuj prostą tabelę / placeholder
} else {
  // Renderuj victory-native wykres
}
```

> [!IMPORTANT]
> **Decyzja wymagana:** Który sposób obsługi wykresów na web preferujesz? 
> - (A) Konfiguracja Skia WebAssembly — pełne wykresy na web
> - (B) Warunkowy import z placeholderem — szybsze do wdrożenia, wykresy tylko na telefonie

---

## 2. Uruchomienie na telefonie (Expo Go)

> [!WARNING]
> Projekt stoi na **WSL Ubuntu 24.04**. Standardowy `--host lan` pokaże adres IP wewnętrzny WSL (172.18.x.x), który **nie jest dostępny** z telefonu bezpośrednio.

### Metoda 1: Tunnel (najprostsza)

```bash
cd Frontend && npx expo start --tunnel
```

- Automatycznie instaluje `@expo/ngrok`
- Generuje publiczny URL dostępny z dowolnej sieci
- Nieco wolniejsza praca (hot reload przez internet)
- **Nie wymaga żadnej konfiguracji Windows/WSL**

### Metoda 2: WSL2 Mirrored Mode (Windows 11)

> [!NOTE]
> Działa tylko na Windows 11. Jeśli masz Windows 10 LTSC — użyj metody 1 lub 3.

```ini
# C:\Users\<Username>\.wslconfig
[wsl2]
networkingMode=mirrored
```

Po edycji: `wsl --shutdown` w PowerShell, potem restart WSL.

### Metoda 3: Port Proxy (Windows 10 — Twój system)

Ponieważ pracujesz na **Windows 10 LTSC 21H2**, musisz ręcznie skonfigurować przekierowanie portu:

**Krok 1** — Sprawdź IP WSL:
```bash
# W WSL
hostname -I
# np. 172.18.0.1
```

**Krok 2** — Przekieruj port (PowerShell jako Administrator):
```powershell
netsh interface portproxy add v4tov4 listenport=8081 listenaddress=0.0.0.0 connectport=8081 connectaddress=172.18.0.1
```

**Krok 3** — Otwórz port w firewall (PowerShell jako Administrator):
```powershell
netsh advfirewall firewall add rule name="Expo Metro" dir=in action=allow protocol=tcp localport=8081
```

**Krok 4** — Ustaw hostname w Expo:
```bash
# Sprawdź IP Windows (ipconfig w PowerShell) i użyj go:
REACT_NATIVE_PACKAGER_HOSTNAME=<WINDOWS_IP> npx expo start --host lan
```

**Krok 5** — Zeskanuj QR z Expo Go na telefonie (telefon musi być w tej samej sieci Wi-Fi co komputer).

### Podsumowanie: Rekomendacja

| Metoda | Trudność | Szybkość | Twój system |
|---|---|---|---|
| `--tunnel` | ⭐ Łatwa | 🐢 Wolna | ✅ Win 10 |
| Mirrored Mode | ⭐⭐ | ⚡ Szybka | ❌ Tylko Win 11 |
| Port Proxy | ⭐⭐⭐ | ⚡ Szybka | ✅ Win 10 |

> [!IMPORTANT]
> **Rekomendacja:** Zacznij od `npx expo start --tunnel` — to najprostsza opcja na Windows 10 LTSC.

---

## 3. Uruchomienie Backendu

Backend musi działać, aby aplikacja mogła logować użytkowników i zapisywać pomiary.

```bash
# 1. Uruchom bazę danych PostgreSQL
cd Backend && docker compose up -d

# 2. Uruchom serwer Spring Boot (port 8080)
cd Backend && ./gradlew bootRun
```

### Konfiguracja sieci Backend ↔ Frontend

| Platforma | Backend URL | Uwagi |
|---|---|---|
| Web (localhost) | `http://localhost:8080` | Działa automatycznie |
| Android Emulator | `http://10.0.2.2:8080` | Mapuje na localhost |
| Expo Go (telefon) | `http://<IP_HOSTA>:8080` | Wymaga port proxy jak Metro |

> [!CAUTION]
> Dla testowania na fizycznym telefonie, backend **też** musi być dostępny z zewnątrz. Trzeba dodać port proxy analogicznie jak dla Metro (port 8080 zamiast 8081). Alternatywnie przy trybie `--tunnel` backend nadal musi być osiągalny z sieci — zmień `getBaseUrl()` w `api/client.ts` na IP komputera.

---

## 4. Ostrzeżenia o wersjach pakietów

Metro zgłasza następujące niezgodności wersji:

```
@react-native-async-storage/async-storage@3.0.2 → expected 2.2.0
expo@54.0.33 → expected ~54.0.34
expo-file-system@19.0.21 → expected ~19.0.22
expo-status-bar@55.0.5 → expected ~3.0.9
react-native@0.81.4 → expected 0.81.5
react-native-safe-area-context@5.7.0 → expected ~5.6.0
react-native-screens@4.24.0 → expected ~4.16.0
@types/react@19.2.14 → expected ~19.1.10
```

Naprawienie za jednym zamachem:
```bash
cd Frontend && npx expo install --fix
```

> [!IMPORTANT]
> **Decyzja wymagana:** Czy chcesz teraz naprawić wersje pakietów komendą `npx expo install --fix`? To może zmienić zachowanie niektórych komponentów, ale zapewni pełną kompatybilność z Expo SDK 54.

---

## 5. Plan Testów (Faza 6)

### Testy Kotlin Backend (MockK + WebFluxTest)

| Test | Opis | Plik |
|---|---|---|
| `MeasurementServiceTest` | Weryfikacja detekcji anomalii, kalkulacja średnich | `Backend/src/test/kotlin/...` |
| `VoiceAIServiceTest` | Mock Gemini API → sprawdzenie parsowania | `Backend/src/test/kotlin/...` |
| `UserControllerWebFluxTest` | `@WebFluxTest` — logowanie via POST | `Backend/src/test/kotlin/...` |
| `MeasurementControllerWebFluxTest` | `@WebFluxTest` — CRUD pomiarów, strumienie Flow | `Backend/src/test/kotlin/...` |
| `ReportControllerWebFluxTest` | `@WebFluxTest` — generowanie PDF, content-type | `Backend/src/test/kotlin/...` |

### Testy React Native (Testing Library)

| Test | Opis | Plik |
|---|---|---|
| `useAppStore.test.ts` | Zustand store — logowanie, logout, toggle motywu | `Frontend/__tests__/store/...` |
| `LoginScreen.test.tsx` | Renderowanie formularza, walidacja pustej nazwy | `Frontend/__tests__/app/...` |
| `DashboardScreen.test.tsx` | Renderowanie mikrofonu, karty pomiaru | `Frontend/__tests__/app/...` |
| `BloodPressureChart.test.tsx` | Renderowanie z < 2 pomiarami (placeholder) | `Frontend/__tests__/components/...` |

### Instalacja zależności testowych (Frontend):

```bash
cd Frontend && npm install --save-dev jest @testing-library/react-native @testing-library/jest-native jest-expo react-test-renderer
```

---

## Open Questions

> [!IMPORTANT]
> 1. **Wykresy na Web:** Czy preferujesz rozwiązanie (A) Skia WebAssembly, czy (B) warunkowy import z placeholderem?
> 2. **Naprawa wersji:** Czy wykonać `npx expo install --fix` teraz?
> 3. **Tryb testowania telefon:** Wolisz zacząć od `--tunnel` (łatwiejsze) czy od konfiguracji port proxy (szybsze)?
> 4. **Testy automatyczne:** Czy chcesz, żebym zaczął implementację Fazy 6 po zatwierdzeniu tego planu, czy najpierw chcesz samodzielnie przetestować aplikację ręcznie na telefonie?
