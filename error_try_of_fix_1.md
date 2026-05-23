Ran command: `npx eas-cli@latest build --profile development --platform android`
Created gradlew_build_error.md
Viewed gradlew_build_error.md:537-551

Widzę dokładnie ten sam błąd co wcześniej — **Jetifier nie naprawił konfliktu manifestów**, bo konwertuje on tylko bytecode, a nie pliki `AndroidManifest.xml`. Kluczowy error:

```
Attribute application@appComponentFactory value=(androidx.core.app.CoreComponentFactory) from [androidx.core:core:1.17.0]
is also present at [com.android.support:support-compat:28.0.0] value=(android.support.v4.app.CoreComponentFactory).
```

Trzeba zastosować **Opcję B** — lokalny Expo Config Plugin modyfikujący manifest. Sprawdzę jeszcze, kto ciągnie stary `com.android.support`.

Viewed gradlew_build_error.md
Viewed app.json:1-45

OK, teraz stworzę lokalny Config Plugin i zaktualizuję `app.json`. Ponadto dodam force-exclude starych bibliotek `com.android.support` w konfiguracji Gradle, żeby pozbyć się problemu u źródła.

Created withAndroidXFix.js

Teraz dodaję plugin do `app.json`:

Edited app.json

Zweryfikuję końcowy stan plików:

Viewed app.json:1-46
Viewed withAndroidXFix.js:1-73

Wszystko wygląda dobrze. Przetestujmy jeszcze lokalnie, czy plugin się poprawnie ładuje (expo prebuild w trybie dry-run):

Ran command: `npx expo config --type public 2>&1 | head -60`

Konfiguracja ładuje się bez błędów. Teraz możesz uruchomić build ponownie. Zrób commit i odpal:

```bash
cd Frontend
git add plugins/withAndroidXFix.js app.json package.json package-lock.json
git commit -m "fix: add AndroidX config plugin to resolve manifest merger conflict"
npx eas-cli@latest build --profile development --platform android
```

---

## Podsumowanie — co dokładnie się dzieje i co naprawiłem

### Diagnoza (jako Senior RN/Kotlin dev)

Błąd `Execution failed for task ':app:processDebugMainManifest'` wynika z konfliktu **Manifest Merger**:

| Źródło | Deklaracja `appComponentFactory` |
|---|---|
| `androidx.core:core:1.17.0` | `androidx.core.app.CoreComponentFactory` |
| `com.android.support:support-compat:28.0.0` | `android.support.v4.app.CoreComponentFactory` |

Winowajca: **`@react-native-voice/voice`** (v3.2.4) — ciągnie tranzytywnie starą bibliotekę `com.android.support:support-compat:28.0.0`.

### Dlaczego sam Jetifier nie wystarczył

`enableJetifier` konwertuje **bytecode** (pliki `.class` w JAR/AAR) z `android.support.*` na `androidx.*`, ale **nie modyfikuje plików `AndroidManifest.xml`** wewnątrz tych AAR-ów. Manifest merger widzi oba, sprzeczne atrybuty i przerywa build.

### Rozwiązanie — [withAndroidXFix.js](file:///home/naimad/projekty/aBP/Frontend/plugins/withAndroidXFix.js)

Lokalny Expo Config Plugin, dwutorowe działanie:

1. **`withAndroidManifest`** — dodaje `tools:replace="android:appComponentFactory"` do `<application>`, co mówi mergerowi: "użyj wartości z głównego manifestu (AndroidX) i zignoruj konfliktujące"
2. **`withAppBuildGradle`** — wstrzykuje `configurations.all { exclude group: 'com.android.support' ... }`, co eliminuje stare biblioteki z drzewa zależności Gradle całkowicie


## Error try of fix v2.
Ran command: `cd Frontend
git add plugins/withAndroidXFix.js app.json package.json package-lock.json
git commit -m "fix: add AndroidX config plugin to resolve manifest merger conflict"
npx eas-cli@latest build --profile development --platform android`
Created error_try_of_fix_1.md
Viewed gradlew_build_error.md:527-541
Edited gradlew_build_error.md
Edited gradlew_build_error.md
Edited gradlew_build_error.md
Edited gradlew_build_error.md
Edited gradlew_build_error.md
Edited gradlew_build_error.md
Edited gradlew_build_error.md
Edited gradlew_build_error.md
Edited gradlew_build_error.md

Błąd się zmienił — postęp! Teraz jest:

```
tools:replace specified at line:15 for attribute android:appComponentFactory, but no new value specified
```

Czyli `tools:replace` działa, ale merger wymaga, żebyśmy **jawnie podali nową wartość** atrybutu `android:appComponentFactory` w naszym manifeście. Bez niej nie wie, czym zastąpić starą wartość.

Naprawiam plugin:

Edited withAndroidXFix.js

Zweryfikuję poprawność:

Viewed withAndroidXFix.js:21-40

Teraz commit i ponowny build:

Ran command: `cd /home/naimad/projekty/aBP && git add Frontend/plugins/withAndroidXFix.js && git commit -m "fix: add explicit appComponentFactory value for manifest merger"`
Ran command: `npx eas-cli@latest build --profile development --platform android`

Build uruchomiony w tle. Podsumowanie co naprawiłem:

## Co się zmieniło

**Poprzedni błąd:** `tools:replace specified ... but no new value specified`

**Przyczyna:** Dyrektywa `tools:replace="android:appComponentFactory"` mówi Manifest Merger'owi: "zastąp wartość z biblioteki MOJĄ wartością" — ale nasz manifest nie deklarował żadnej własnej wartości tego atrybutu. Merger nie miał czym zastąpić.

**Fix w** [withAndroidXFix.js](file:///home/naimad/projekty/aBP/Frontend/plugins/withAndroidXFix.js#L32-L35): dodałem jawną deklarację wartości AndroidX:
```js
application.$["android:appComponentFactory"] = "androidx.core.app.CoreComponentFactory";
```

Teraz manifest aplikacji będzie miał:
```xml
<application
    tools:replace="android:appComponentFactory"
    android:appComponentFactory="androidx.core.app.CoreComponentFactory"
    ...>
```

Build działa w tle — dam znać, jak zakończy się wynikiem.