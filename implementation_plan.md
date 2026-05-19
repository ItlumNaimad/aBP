# Plan Implementacji Aplikacji do Rejestracji Ciśnienia Krwi i Tętna

Dokument ten opisuje planowaną architekturę, podział na moduły oraz strukturę aplikacji webowej w odpowiedzi na wymagania projektu akademickiego. Po zakończeniu prac w backendzie, aplikacja przechodzi w cykl tworzenia warstwy Frontendowej opierając się na w pełni interaktywnym React Native (Expo).

## User Review Required

> [!IMPORTANT]
> Technologie kluczowe zostały zatwierdzone i wdrożone:
>
> - ✅ **React Native Paper** (Material Design 3) — motyw medyczny teal/cyan z powiększonymi czcionkami.
> - ✅ **Zustand** — globalny zarządzacz stanu z persystencją AsyncStorage.
> - ✅ **Victory Native** — interaktywne wykresy liniowe ciśnienia.
> - ✅ **expo-file-system** v19 + **expo-sharing** — zapis i udostępnianie PDF.

## Proposed Changes

### Architektura Aplikacji Mobilnej (Frontend - Faza 4 i 5)

Aplikacja kliencka została zbudowana w środowisku React Native (z użyciem menedżera procesów Expo) ze specyficznym ukierunkowaniem na urządzenia z systemem **Android**. Ze względu na grupę docelową (osoby starsze, niedowidzące), zdefiniowano główne filary interfejsu: olbrzymie cele dotykowe i jasna paleta kontrastująca.

#### [NEW] `Frontend/app/`

Folder odpowiedzialny za file-based routing w standardzie dostarczanym przez **Expo Router**:

- `/app/_layout.tsx` - Główny provider ułatwiający ładowanie i aplikację wspólnego motywu (`ThemeProvider`) na całą aplikację.
- `/app/index.tsx` - Główny hub powitalny aplikacji; widok logowania i identyfikacji pacjenta.
- `/app/(tabs)/_layout.tsx` - Nawigacja dolna ze skalowanymi ikonami dla głównego pulpitu.
- `/app/(tabs)/dashboard.tsx` - Zestawienie wskaźników z przyciskiem '+ Dodaj wynik', główny zunifikowany dialog formularza dla dodawania wyników ręcznie oraz przez asystenta AI.
- `/app/(tabs)/history.tsx` - Lista historii pomiarów z interaktywnym wykresem liniowym (`victory-native`) oraz oznaczeniami anomalii.
- `/app/(tabs)/settings.tsx` - Przełącznik motywu, pobieranie raportu PDF na urządzenie, wylogowanie.

#### [NEW] `Frontend/store/`

Zarządzanie kluczowym stanem aplikacji przez platformę **Zustand**:

- `/store/useAppStore.ts` - Deklaracje akcji, status zalogowanych zmiennych użytkownika, zapisanie trybu Light/Dark dla persystentności użycia aplikacji.

#### [NEW] `Frontend/api/`

Moduły wiążące interfejs UI z logiką backendową Reaktywną postawioną w WSL:

- `/api/client.ts` - Wrapper na Axios z automatycznym wykrywaniem środowiska (Android emulator/fizyczny telefon/web), przekierowany na port 8080 hosta. Zawiera funkcję `savePdfToDevice` wykorzystującą `expo-file-system` v19 i `expo-sharing`.

#### [NEW] `Frontend/components/`

Komponenty wielorazowe:

- `/components/BloodPressureChart.tsx` - Interaktywny wykres liniowy ciśnienia (SYS/DIA/Puls) oparty o `victory-native` z legendą, tooltipem na dotyk i chronologiczną osią czasu.

#### [NEW] `Frontend/hooks/`

Hooki abstrakcyjne:

- `/hooks/useVoiceInput.ts` - Abstrakcyjny hook opakowujący logikę STT. Obecnie: fallback na ręczny tekst. Interfejs przygotowany do podpięcia `@react-native-voice/voice` w Development Build.

#### [NEW] `Frontend/babel.config.js`

Konfiguracja Babel z pluginem `react-native-reanimated/plugin` (wymagany przez `victory-native`).

### Architektura Backendowa (Zrealizowane Wcześniej)

- Backend zdefiniowany przy użyciu Kotlin, Spring WebFlux, w środowisku non-blocking na coroutinach i warstwie dostępu R2DBC do kontenerów Dockera PostgreSQL (zakończone).
- Zawiera dedykowany i zaimplementowany proces generowania pdf (`Dispatchers.IO`).
- Konwersja głosu zrealizowana jako autoryzowany pipeline w Gemini API po wywołaniu odpowiedniego kontrolera restowego.

## Open Questions

> [!WARNING]
> Mam kilka pytań potwierdzających i projektowych:
>
> 1. W dokumencie tasks.md widniała sugestia `Zustand/Context API`. Czy zgadzasz się, aby zrealizować podłogę systemową za pomocą samego i wygodniejszego z tych dwóch: **Zustanda**?
> 1.1 Tak, wykorzystajmy Zustand. Jest to prostsze i bardziej wydajne rozwiązanie.
> 2. Proponuję **React Native Paper** jako główną bibliotekę wyglądu do szybkiego zapewnienia odpowiednich proporcji dostępności - spełni wymagania łatwej obsługi i wyglądu dla starczych osób, a dodatkowo zawiera od razu system motywów, na którym nam zależy. Jesteś na to otwarty?
> 2.1 Tak, React Native Paper jest dobrym wyborem. Jest to biblioteka, która zapewnia wysoką jakość interfejsu użytkownika i jest łatwa w użyciu.
> 3. Na ten moment widoki Expo są puste, czy mogę usunąć zawartość testową z paczki Expo podczas robienia setupu?
> 3.1 Tak, usuń zawartość testową z paczki Expo podczas robienia setupu.

> [!IMPORTANT]
> Projekt stoi na WSL'u Ubuntu 24.04. Trzeba o tym pamiętać podczas konfiguracji środowiska i przekierowywaniu portu 8080 do hosta z backendu.
> Expo Go ma tylko moduły które Expo oficjalnie wspiera. Jeśli potrzebujecie natywnego modułu którego nie ma  (np. @react-native-voice/voice) — Expo Go NIE WYSTARCZY.
> Wtedy potrzebujecie Development Build:
> npx expo prebuild
> npx expo run:android

## Future Developments (Faza 8)

Mimo ukończenia i wdrożenia kluczowych funkcjonalności, architektura projektu pozostawia furtkę na niezbędne z punktu widzenia produkcji komercyjnej udoskonalenia:

1. **Przejście na Expo Development Build**: Aby zintegrować wbudowaną bibliotekę do nasłuchu mowy (`@react-native-voice/voice`), nie wystarczy nam środowisko Expo Go. Konieczne jest wygenerowanie natywnych folderów `android`/`ios` poprzez komendę `npx expo prebuild`. Wymaga to jednak starannego przygotowania: poprawnego zainstalowania pakietów Android SDK, NDK, konfiguracji zmiennych środowiskowych (ANDROID_HOME) oraz ewentualnego rozwiązywania konfliktów Gradle dla paczek React Native. Ten proces zostanie solidnie udokumentowany, by zapewnić gładkie i powtarzalne środowisko kompilacji.
2. **Funkcjonalność Offline**: Wykorzystanie istniejącego `AsyncStorage` nie tylko do motywów, ale też do implementacji kolejki żądań (Request Queue), w celu uodpornienia się na utratę łączności z siecią. Utrzyma to w 100% lokalny, bezpieczny charakter bazy powiązanej z danym telefonem.
3. **Zastosowanie zaawansowanego RAG (Gemini)**: Przesyłanie dotychczasowej historii pacjenta do modelu celem wyłuskania spersonalizowanych zaleceń zdrowotnych na każdy dzień.

## Verification Plan

Weryfikacja zmian po stronie mobilnej przebiegnie następująco:

### Powolne walidacje manualne

- Należy odpalić komendę `npm start` po odpowiednich przygotowaniach w rejonach WSL co poskutkuje wywołaniem dedykowanego pakietu Metro Bundler, następnie przetestowanie interfejsu chociażby podłączając smartfon z aplikacją Expo Go celując aparatami na kod QR.
- Weryfikacja wizualna obejmująca próbę zmiany motywu, nawigowanie pomiędzy zakładkami ekranów, badanie gładkości animacji.

### Testy Automatyczne Frontendu

- Implementacja testów renderowania jednostkowego za pomocą `@testing-library/react-native`.
- Testy na prawidłowe budowanie logicznych stanów redukcyjnych w plikach zarządzających `useAppStore.ts`.

## TESTY
# Backend (nie wymaga bazy danych!)
cd Backend && ./gradlew test

# Frontend (nie wymaga emulatora!)
cd Frontend && npx jest --verbose
