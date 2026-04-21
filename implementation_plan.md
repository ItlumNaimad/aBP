# Plan Implementacji Aplikacji do Rejestracji Ciśnienia Krwi i Tętna

Dokument ten opisuje planowaną architekturę, podział na moduły oraz strukturę aplikacji webowej w odpowiedzi na wymagania projektu akademickiego. Po zakończeniu prac w backendzie, aplikacja przechodzi w cykl tworzenia warstwy Frontendowej opierając się na w pełni interaktywnym React Native (Expo).

## User Review Required

> [!IMPORTANT]
> Przed rozpoczęciem właściwego programowania frontendu (Faza 4 oraz 5) wymaga się zatwierdzenia wybranych technologii kluczowych.
>
> - Zaplanowano oparcie dostępności i wyglądu o UI **React Native Paper** ze względu na solidne wsparcie Material Design 3 i wbudowany motyw ciemny/jasny.
> - Zaproponowano wykorzystanie pakietu **Zustand** jako global state manager.

## Proposed Changes

### Architektura Aplikacji Mobilnej (Frontend - Faza 4 i 5)

Aplikacja kliencka zostanie zbudowana w środowisku React Native (z użyciem menedżera procesów Expo) ze specyficznym ukierunkowaniem na urządzenia z systemem **Android**. Ze względu na grupę docelową (osoby starsze, niedowidzące), zdefiniowano główne filary interfejsu: olbrzymie cele dotykowe i jasna paleta konstrastująca.

#### [NEW] `Frontend/app/`

Folder odpowiedzialny za file-based routing w standardzie dostarczanym przez **Expo Router**:

- `/app/_layout.tsx` - Główny provider ułatwiający ładowanie i aplikację wspólnego motywu (`ThemeProvider`) na całą aplikację.
- `/app/index.tsx` - Główny hub powitalny aplikacji; widok logowania i identyfikacji pacjenta.
- `/app/(tabs)/_layout.tsx` - Nawigacja dolna ze skalowanymi ikonami dla głównego pulpitu.
- `/app/(tabs)/dashboard.tsx` - Zestawienie wskaźników z ogromnym polem mikrofonu przygotowanym pod wstrzyknięcie sygnału Audio.
- `/app/(tabs)/history.tsx` - Prosty wylistowany zbiór historii bazy danych, z odpowiednimi ikonami "strzałek w górę/w dół" przy anomaliach medycznych.

#### [NEW] `Frontend/store/`

Zarządzanie kluczowym stanem aplikacji przez platformę **Zustand**:

- `/store/useAppStore.ts` - Deklaracje akcji, status zalogowanych zmiennych użytkownika, zapisanie trybu Light/Dark dla persystentności użycia aplikacji.

#### [NEW] `Frontend/api/`

Moduły wiążące interfejs UI z logiką backendową Reaktywną postawioną w WSL:

- `/api/client.ts` - Ustalenie klasy wrappera na domyślny protokół do wysyłania (bazujący na bibliotece Axios lub prostym `fetch`), przekierowany na port 8080 lokalnej maszyny.

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

## Verification Plan

Weryfikacja zmian po stronie mobilnej przebiegnie następująco:

### Powolne walidacje manualne

- Należy odpalić komendę `npm start` po odpowiednich przygotowaniach w rejonach WSL co poskutkuje wywołaniem dedykowanego pakietu Metro Bundler, następnie przetestowanie interfejsu chociażby podłączając smartfon z aplikacją Expo Go celując aparatami na kod QR.
- Weryfikacja wizualna obejmująca próbę zmiany motywu, nawigowanie pomiędzy zakładkami ekranów, badanie gładkości animacji.

### Testy Automatyczne Frontendu

- Implementacja testów renderowania jednostkowego za pomocą `@testing-library/react-native`.
- Testy na prawidłowe budowanie logicznych stanów redukcyjnych w plikach zarządzających `useAppStore.ts`.
