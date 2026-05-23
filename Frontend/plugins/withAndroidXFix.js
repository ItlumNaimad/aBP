/**
 * withAndroidXFix - Expo Config Plugin
 *
 * Fixes the AndroidX vs android.support manifest merger conflict.
 *
 * Problem: @react-native-voice/voice (or its transitive deps) pulls in
 * com.android.support:support-compat:28.0.0 which declares
 * android:appComponentFactory=android.support.v4.app.CoreComponentFactory,
 * conflicting with androidx.core:core which declares
 * android:appComponentFactory=androidx.core.app.CoreComponentFactory.
 *
 * Solution:
 *   1. Directly patch AndroidManifest.xml (raw text) to add both
 *      tools:replace="android:appComponentFactory" AND the replacement value.
 *      We use withDangerousMod instead of withAndroidManifest because expo's
 *      xml2js serializer silently drops namespaced attributes like
 *      android:appComponentFactory.
 *   2. Force-exclude old com.android.support deps from Gradle resolution.
 */
const {
  withDangerousMod,
  withAppBuildGradle,
} = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

function withAndroidXFix(config) {
  // --- Step 1: Directly patch AndroidManifest.xml as raw text ---
  config = withDangerousMod(config, [
    "android",
    (modConfig) => {
      const manifestPath = path.join(
        modConfig.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "AndroidManifest.xml"
      );

      let manifest = fs.readFileSync(manifestPath, "utf-8");

      // 1a. Add xmlns:tools namespace to <manifest> if missing
      if (!manifest.includes("xmlns:tools")) {
        manifest = manifest.replace(
          "<manifest ",
          '<manifest xmlns:tools="http://schemas.android.com/tools" '
        );
      }

      // 1b. Add tools:replace and android:appComponentFactory to <application>
      //     Only if not already present
      if (!manifest.includes("tools:replace")) {
        manifest = manifest.replace(
          "<application",
          '<application\n      android:appComponentFactory="androidx.core.app.CoreComponentFactory"\n      tools:replace="android:appComponentFactory"'
        );
      }

      fs.writeFileSync(manifestPath, manifest, "utf-8");
      return modConfig;
    },
  ]);

  // --- Step 2: Force-exclude old android.support from Gradle ---
  config = withAppBuildGradle(config, (modConfig) => {
    const contents = modConfig.modResults.contents;

    // Guard: don't inject twice
    if (contents.includes("// [withAndroidXFix]")) {
      return modConfig;
    }

    const excludeBlock = `
// [withAndroidXFix] Force-exclude legacy android.support libraries
configurations.all {
    exclude group: 'com.android.support', module: 'support-compat'
    exclude group: 'com.android.support', module: 'support-v4'
    exclude group: 'com.android.support', module: 'support-core-utils'
    exclude group: 'com.android.support', module: 'support-annotations'
    exclude group: 'com.android.support', module: 'animated-vector-drawable'
    exclude group: 'com.android.support', module: 'support-vector-drawable'
    exclude group: 'com.android.support', module: 'versionedparcelable'
}
`;

    // Insert before the first `dependencies {` block
    modConfig.modResults.contents = contents.replace(
      /dependencies\s*\{/,
      `${excludeBlock}\ndependencies {`
    );

    return modConfig;
  });

  return config;
}

module.exports = withAndroidXFix;
