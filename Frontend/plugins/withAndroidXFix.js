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
 *   1. Add tools:replace="android:appComponentFactory" to <application> in the manifest
 *   2. Force-exclude old com.android.support deps from Gradle resolution
 */
const {
  withAndroidManifest,
  withAppBuildGradle,
} = require("expo/config-plugins");

function withAndroidXFix(config) {
  // --- Step 1: Patch AndroidManifest.xml ---
  config = withAndroidManifest(config, (modConfig) => {
    const manifest = modConfig.modResults.manifest;

    // Ensure xmlns:tools namespace is declared
    manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";

    const application = manifest.application?.[0];
    if (application) {
      // Tell the manifest merger to prefer our (AndroidX) value
      application.$["tools:replace"] = "android:appComponentFactory";
    }

    return modConfig;
  });

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
