Running 'gradlew :app:assembleDebug' in /home/expo/workingdir/build/Frontend/android
Downloading https://services.gradle.org/distributions/gradle-8.14.3-bin.zip
10%
20%.
30%.
40%.
50%.
60%
70%.
80%.
90%.
100%
Welcome to Gradle 8.14.3!
Here are the highlights of this release:
 - Java 24 support
- GraalVM Native Image toolchain selection
- Enhancements to test reporting
- Build Authoring improvements
For more details see https://docs.gradle.org/8.14.3/release-notes.html
To honour the JVM settings for this build a single-use Daemon process will be forked. For more on this, please refer to https://docs.gradle.org/8.14.3/userguide/gradle_daemon.html#sec:disabling_the_daemon in the Gradle documentation.
Daemon will be stopped at the end of the build
> Configure project :expo-gradle-plugin:expo-autolinking-plugin
w: file:///home/expo/workingdir/build/Frontend/node_modules/expo-modules-autolinking/android/expo-gradle-plugin/expo-autolinking-plugin/build.gradle.kts:25:3: 'kotlinOptions(KotlinJvmOptionsDeprecated /* = KotlinJvmOptions */.() -> Unit): Unit' is deprecated. Please migrate to the compilerOptions DSL. More details are here: https://kotl.in/u1r8ln
> Configure project :expo-gradle-plugin:expo-autolinking-settings-plugin
w: file:///home/expo/workingdir/build/Frontend/node_modules/expo-modules-autolinking/android/expo-gradle-plugin/expo-autolinking-settings-plugin/build.gradle.kts:30:3: 'kotlinOptions(KotlinJvmOptionsDeprecated /* = KotlinJvmOptions */.() -> Unit): Unit' is deprecated. Please migrate to the compilerOptions DSL. More details are here: https://kotl.in/u1r8ln
> Task :expo-gradle-plugin:expo-autolinking-plugin-shared:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :expo-gradle-plugin:expo-autolinking-settings-plugin:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :gradle-plugin:shared:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :gradle-plugin:settings-plugin:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :gradle-plugin:settings-plugin:pluginDescriptors
> Task :expo-gradle-plugin:expo-autolinking-settings-plugin:pluginDescriptors
> Task :gradle-plugin:settings-plugin:processResources
> Task :expo-gradle-plugin:expo-autolinking-settings-plugin:processResources
> Task :expo-gradle-plugin:expo-autolinking-plugin-shared:processResources NO-SOURCE
> Task :gradle-plugin:shared:processResources NO-SOURCE
> Task :gradle-plugin:shared:compileKotlin
> Task :gradle-plugin:shared:compileJava NO-SOURCE
> Task :gradle-plugin:shared:classes UP-TO-DATE
> Task :gradle-plugin:shared:jar
> Task :expo-gradle-plugin:expo-autolinking-plugin-shared:compileKotlin
> Task :expo-gradle-plugin:expo-autolinking-plugin-shared:compileJava NO-SOURCE
> Task :expo-gradle-plugin:expo-autolinking-plugin-shared:classes UP-TO-DATE
> Task :expo-gradle-plugin:expo-autolinking-plugin-shared:jar
> Task :gradle-plugin:settings-plugin:compileKotlin
> Task :gradle-plugin:settings-plugin:compileJava NO-SOURCE
> Task :gradle-plugin:settings-plugin:classes
> Task :gradle-plugin:settings-plugin:jar
> Task :expo-gradle-plugin:expo-autolinking-settings-plugin:compileKotlin
> Task :expo-gradle-plugin:expo-autolinking-settings-plugin:compileJava NO-SOURCE
> Task :expo-gradle-plugin:expo-autolinking-settings-plugin:classes
> Task :expo-gradle-plugin:expo-autolinking-settings-plugin:jar
> Configure project :expo-dev-launcher-gradle-plugin
w: file:///home/expo/workingdir/build/Frontend/node_modules/expo-dev-launcher/expo-dev-launcher-gradle-plugin/build.gradle.kts:25:3: 'kotlinOptions(KotlinJvmOptionsDeprecated /* = KotlinJvmOptions */.() -> Unit): Unit' is deprecated. Please migrate to the compilerOptions DSL. More details are here: https://kotl.in/u1r8ln
> Configure project :expo-module-gradle-plugin
w: file:///home/expo/workingdir/build/Frontend/node_modules/expo-modules-core/expo-module-gradle-plugin/build.gradle.kts:58:3: 'kotlinOptions(KotlinJvmOptionsDeprecated /* = KotlinJvmOptions */.() -> Unit): Unit' is deprecated. Please migrate to the compilerOptions DSL. More details are here: https://kotl.in/u1r8ln
> Task :expo-gradle-plugin:expo-autolinking-plugin:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :expo-dev-launcher-gradle-plugin:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :expo-module-gradle-plugin:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :gradle-plugin:react-native-gradle-plugin:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :expo-dev-launcher-gradle-plugin:pluginDescriptors
> Task :expo-module-gradle-plugin:pluginDescriptors
> Task :expo-dev-launcher-gradle-plugin:processResources
> Task :expo-module-gradle-plugin:processResources
> Task :expo-gradle-plugin:expo-autolinking-plugin:pluginDescriptors
> Task :expo-gradle-plugin:expo-autolinking-plugin:processResources
> Task :gradle-plugin:react-native-gradle-plugin:pluginDescriptors
> Task :gradle-plugin:react-native-gradle-plugin:processResources
> Task :expo-gradle-plugin:expo-autolinking-plugin:compileKotlin
> Task :expo-gradle-plugin:expo-autolinking-plugin:compileJava NO-SOURCE
> Task :expo-gradle-plugin:expo-autolinking-plugin:classes
> Task :expo-gradle-plugin:expo-autolinking-plugin:jar
> Task :gradle-plugin:react-native-gradle-plugin:compileKotlin
> Task :gradle-plugin:react-native-gradle-plugin:compileJava NO-SOURCE
> Task :gradle-plugin:react-native-gradle-plugin:classes
> Task :gradle-plugin:react-native-gradle-plugin:jar
> Task :expo-dev-launcher-gradle-plugin:compileKotlin
> Task :expo-dev-launcher-gradle-plugin:compileJava
NO-SOURCE
> Task :expo-dev-launcher-gradle-plugin:classes
> Task :expo-dev-launcher-gradle-plugin:jar
> Task :expo-module-gradle-plugin:compileKotlin
w: file:///home/expo/workingdir/build/Frontend/node_modules/expo-modules-core/expo-module-gradle-plugin/src/main/kotlin/expo/modules/plugin/android/AndroidLibraryExtension.kt:9:24 'var targetSdk: Int?' is deprecated. Will be removed from library DSL in v9.0. Use testOptions.targetSdk or/and lint.targetSdk instead.
> Task :expo-module-gradle-plugin:compileJava NO-SOURCE
> Task :expo-module-gradle-plugin:classes
> Task :expo-module-gradle-plugin:jar
> Configure project :
[32m[ExpoRootProject][0m Using the following versions:
- buildTools:  [32m36.0.0[0m
  - minSdk:      [32m24[0m
  - compileSdk:  [32m36[0m
  - targetSdk:   [32m36[0m
  - ndk:         [32m27.1.12297006[0m
  - kotlin:      [32m2.1.20[0m
  - ksp:         [32m2.1.20-2.0.1[0m
> Configure project :app
ℹ️  [33mApplying gradle plugin[0m '[32mexpo-dev-launcher-gradle-plugin[0m'
> Configure project :expo
Using expo modules
  - [32mexpo-constants[0m (18.0.13)
  - [32mexpo-dev-client[0m (6.0.21)
- [32mexpo-dev-launcher[0m (6.0.21)
- [32mexpo-dev-menu[0m (7.0.19)
- [32mexpo-dev-menu-interface[0m (2.0.0)
- [32mexpo-json-utils[0m (0.15.0)
- [32mexpo-manifests[0m (1.0.11)
- [32mexpo-modules-core[0m (3.0.30)
- [32mexpo-updates-interface[0m (2.0.0)
  - [33m[📦][0m [32mexpo-asset[0m (12.0.13)
  - [33m[📦][0m [32mexpo-file-system[0m (19.0.22)
  - [33m[📦][0m [32mexpo-font[0m (14.0.11)
  - [33m[📦][0m [32mexpo-keep-awake[0m (15.0.8)
  - [33m[📦][0m [32mexpo-linking[0m (8.0.12)
  - [33m[📦][0m [32mexpo-sharing[0m (14.0.8)
> Configure project :react-native-worklets-core
Checking the license for package NDK (Side by side) 27.0.12077973 in /home/expo/Android/Sdk/licenses
License for package NDK (Side by side) 27.0.12077973 accepted.
Preparing "Install NDK (Side by side) 27.0.12077973 v.27.0.12077973".
"Install NDK (Side by side) 27.0.12077973 v.27.0.12077973" ready.
Installing NDK (Side by side) 27.0.12077973 in /home/expo/Android/Sdk/ndk/27.0.12077973
"Install NDK (Side by side) 27.0.12077973 v.27.0.12077973" complete.
"Install NDK (Side by side) 27.0.12077973 v.27.0.12077973" finished.
> Configure project :shopify_react-native-skia
react-native-skia: node_modules/ found at: /home/expo/workingdir/build/Frontend/node_modules
react-native-skia: RN Version: 81 / 0.81.5
react-native-skia: isSourceBuild: false
react-native-skia: PrebuiltDir: /home/expo/workingdir/build/Frontend/node_modules/@shopify/react-native-skia/android/build/react-native-0*/jni
react-native-skia: buildType: debug
react-native-skia: buildDir: /home/expo/workingdir/build/Frontend/node_modules/@shopify/react-native-skia/android/build
react-native-skia: node_modules: /home/expo/workingdir/build/Frontend/node_modules
react-native-skia: Enable Prefab: true
react-native-skia: aar state post 70, do nothing
Checking the license for package Android SDK Build-Tools 36 in /home/expo/Android/Sdk/licenses
License for package Android SDK Build-Tools 36 accepted.
Preparing "Install Android SDK Build-Tools 36 v.36.0.0".
"Install Android SDK Build-Tools 36 v.36.0.0" ready.
Installing Android SDK Build-Tools 36 in /home/expo/Android/Sdk/build-tools/36.0.0
"Install Android SDK Build-Tools 36 v.36.0.0" complete.
"Install Android SDK Build-Tools 36 v.36.0.0" finished.
[=========                              ] 25%                                   
[=========                              ] 25% Fetch remote repository...        
[=======================================] 100% Fetch remote repository...
> Task :expo-dev-client:preBuild UP-TO-DATE
> Task :expo-dev-launcher:preBuild UP-TO-DATE
> Task :expo-dev-menu:preBuild UP-TO-DATE
> Task :expo-dev-menu-interface:preBuild UP-TO-DATE
> Task :expo-json-utils:preBuild UP-TO-DATE
> Task :expo-manifests:preBuild UP-TO-DATE
> Task :expo-modules-core:preBuild UP-TO-DATE
> Task :expo-updates-interface:preBuild UP-TO-DATE
> Task :react-native-async-storage_async-storage:generateCodegenSchemaFromJavaScript
> Task :expo-constants:createExpoConfig
> Task :expo-constants:preBuild
The NODE_ENV environment variable is required but was not specified. Ensure the project is bundled with Expo CLI or NODE_ENV is set. Using only .env.local and .env
> Task :expo:generatePackagesList
> Task :expo:preBuild
> Task :react-native-reanimated:assertMinimalReactNativeVersionTask
> Task :react-native-reanimated:assertNewArchitectureEnabledTask SKIPPED
> Task :react-native-async-storage_async-storage:generateCodegenArtifactsFromSchema
> Task :react-native-async-storage_async-storage:preBuild
> Task :react-native-reanimated:assertWorkletsVersionTask
> Task :react-native-gesture-handler:generateCodegenSchemaFromJavaScript
> Task :react-native-safe-area-context:generateCodegenSchemaFromJavaScript
> Task :react-native-reanimated:generateCodegenSchemaFromJavaScript
> Task :react-native-gesture-handler:generateCodegenArtifactsFromSchema
> Task :react-native-gesture-handler:preBuild
> Task :react-native-reanimated:generateCodegenArtifactsFromSchema
> Task :react-native-safe-area-context:generateCodegenArtifactsFromSchema
> Task :react-native-safe-area-context:preBuild
> Task :react-native-reanimated:prepareReanimatedHeadersForPrefabs
> Task :react-native-reanimated:preBuild
> Task :react-native-voice_voice:preBuild UP-TO-DATE
> Task :react-native-screens:generateCodegenSchemaFromJavaScript
> Task :react-native-worklets:assertMinimalReactNativeVersionTask
> Task :react-native-worklets:assertNewArchitectureEnabledTask SKIPPED
> Task :react-native-svg:generateCodegenSchemaFromJavaScript
> Task :react-native-worklets:generateCodegenSchemaFromJavaScript
> Task :react-native-screens:generateCodegenArtifactsFromSchema
> Task :react-native-screens:preBuild
> Task :react-native-worklets:generateCodegenArtifactsFromSchema
> Task :react-native-svg:generateCodegenArtifactsFromSchema
> Task :react-native-svg:preBuild
> Task :react-native-worklets-core:generateCodegenSchemaFromJavaScript
> Task :react-native-worklets:prepareWorkletsHeadersForPrefabs
> Task :react-native-worklets:preBuild
> Task :expo:preDebugBuild
> Task :expo:writeDebugAarMetadata
> Task :shopify_react-native-skia:generateCodegenSchemaFromJavaScript
> Task :react-native-worklets-core:generateCodegenArtifactsFromSchema
> Task :react-native-worklets-core:prepareHeaders
> Task :react-native-worklets-core:preBuild
> Task :expo-constants:preDebugBuild
> Task :expo-constants:writeDebugAarMetadata
> Task :expo-dev-client:preDebugBuild UP-TO-DATE
> Task :shopify_react-native-skia:generateCodegenArtifactsFromSchema
> Task :expo-dev-client:writeDebugAarMetadata
> Task :shopify_react-native-skia:prepareHeaders
> Task :shopify_react-native-skia:preBuild
> Task :expo-dev-launcher:preDebugBuild UP-TO-DATE
> Task :expo-dev-launcher:writeDebugAarMetadata
> Task :expo-dev-menu:preDebugBuild UP-TO-DATE
> Task :expo-dev-menu:writeDebugAarMetadata
> Task :expo-dev-menu-interface:preDebugBuild UP-TO-DATE
> Task :expo-dev-menu-interface:writeDebugAarMetadata
> Task :expo-json-utils:preDebugBuild UP-TO-DATE
> Task :expo-json-utils:writeDebugAarMetadata
> Task :expo-manifests:preDebugBuild UP-TO-DATE
> Task :expo-manifests:writeDebugAarMetadata
> Task :expo-modules-core:preDebugBuild UP-TO-DATE
> Task :expo-modules-core:writeDebugAarMetadata
> Task :expo-updates-interface:preDebugBuild UP-TO-DATE
> Task :expo-updates-interface:writeDebugAarMetadata
> Task :react-native-async-storage_async-storage:preDebugBuild
> Task :react-native-async-storage_async-storage:writeDebugAarMetadata
> Task :react-native-gesture-handler:preDebugBuild
> Task :react-native-gesture-handler:writeDebugAarMetadata
> Task :react-native-reanimated:preDebugBuild
> Task :react-native-reanimated:writeDebugAarMetadata
> Task :react-native-safe-area-context:preDebugBuild
> Task :react-native-safe-area-context:writeDebugAarMetadata
> Task :react-native-screens:preDebugBuild
> Task :react-native-screens:writeDebugAarMetadata
> Task :react-native-svg:preDebugBuild
> Task :react-native-svg:writeDebugAarMetadata
> Task :react-native-voice_voice:preDebugBuild UP-TO-DATE
> Task :react-native-voice_voice:writeDebugAarMetadata
> Task :react-native-worklets:preDebugBuild
> Task :react-native-worklets:writeDebugAarMetadata
> Task :react-native-worklets-core:preDebugBuild
> Task :react-native-worklets-core:writeDebugAarMetadata
> Task :shopify_react-native-skia:preDebugBuild
> Task :shopify_react-native-skia:writeDebugAarMetadata
> Task :expo:generateDebugResValues
> Task :expo:generateDebugResources
> Task :expo:packageDebugResources
> Task :expo-constants:generateDebugResValues
> Task :expo-constants:generateDebugResources
> Task :expo-constants:packageDebugResources
> Task :expo-dev-client:generateDebugResValues
> Task :expo-dev-client:generateDebugResources
> Task :expo-dev-client:packageDebugResources
> Task :expo-dev-launcher:generateDebugResValues
> Task :expo-dev-launcher:generateDebugResources
> Task :expo-dev-launcher:packageDebugResources
> Task :expo-dev-menu:generateDebugResValues
> Task :expo-dev-menu:generateDebugResources
> Task :expo-dev-menu:packageDebugResources
> Task :expo-dev-menu-interface:generateDebugResValues
> Task :expo-dev-menu-interface:generateDebugResources
> Task :expo-dev-menu-interface:packageDebugResources
> Task :expo-json-utils:generateDebugResValues
> Task :expo-json-utils:generateDebugResources
> Task :expo-json-utils:packageDebugResources
> Task :expo-manifests:generateDebugResValues
> Task :expo-manifests:generateDebugResources
> Task :expo-manifests:packageDebugResources
> Task :expo-modules-core:generateDebugResValues
> Task :expo-modules-core:generateDebugResources
> Task :expo-modules-core:packageDebugResources
> Task :expo-updates-interface:generateDebugResValues
> Task :expo-updates-interface:generateDebugResources
> Task :expo-updates-interface:packageDebugResources
> Task :react-native-async-storage_async-storage:generateDebugResValues
> Task :react-native-async-storage_async-storage:generateDebugResources
> Task :react-native-async-storage_async-storage:packageDebugResources
> Task :react-native-gesture-handler:generateDebugResValues
> Task :react-native-gesture-handler:generateDebugResources
> Task :react-native-gesture-handler:packageDebugResources
> Task :react-native-reanimated:generateDebugResValues
> Task :react-native-reanimated:generateDebugResources
> Task :react-native-reanimated:packageDebugResources
> Task :react-native-safe-area-context:generateDebugResValues
> Task :react-native-safe-area-context:generateDebugResources
> Task :react-native-safe-area-context:packageDebugResources
> Task :react-native-screens:generateDebugResValues
> Task :react-native-screens:generateDebugResources
> Task :react-native-screens:packageDebugResources
> Task :react-native-svg:generateDebugResValues
> Task :react-native-svg:generateDebugResources
> Task :react-native-svg:packageDebugResources
> Task :react-native-voice_voice:generateDebugResValues
> Task :react-native-voice_voice:generateDebugResources
> Task :react-native-voice_voice:packageDebugResources
> Task :react-native-worklets:generateDebugResValues
> Task :react-native-worklets:generateDebugResources
> Task :react-native-worklets:packageDebugResources
> Task :react-native-worklets-core:generateDebugResValues
> Task :react-native-worklets-core:generateDebugResources
> Task :react-native-worklets-core:packageDebugResources
> Task :shopify_react-native-skia:generateDebugResValues
> Task :shopify_react-native-skia:generateDebugResources
> Task :shopify_react-native-skia:packageDebugResources
> Task :expo:extractDeepLinksDebug
> Task :expo:processDebugManifest
> Task :expo-constants:extractDeepLinksDebug
> Task :expo-constants:processDebugManifest
> Task :expo-dev-client:extractDeepLinksDebug
> Task :expo-dev-client:processDebugManifest
> Task :expo-dev-launcher:extractDeepLinksDebug
> Task :expo-dev-launcher:processDebugManifest
> Task :expo-dev-menu:extractDeepLinksDebug
> Task :expo-dev-menu:processDebugManifest
> Task :expo-dev-menu-interface:extractDeepLinksDebug
> Task :expo-dev-menu-interface:processDebugManifest
> Task :expo-json-utils:extractDeepLinksDebug
> Task :expo-json-utils:processDebugManifest
> Task :expo-manifests:extractDeepLinksDebug
> Task :expo-manifests:processDebugManifest
> Task :expo-modules-core:extractDeepLinksDebug
> Task :expo-modules-core:processDebugManifest
/home/expo/workingdir/build/Frontend/node_modules/expo-modules-core/android/src/main/AndroidManifest.xml:8:9-11:45 Warning:
	meta-data#com.facebook.soloader.enabled@android:value was tagged at AndroidManifest.xml:8 to replace other declarations but no other declaration present
> Task :expo-updates-interface:extractDeepLinksDebug
> Task :expo-updates-interface:processDebugManifest
> Task :react-native-async-storage_async-storage:extractDeepLinksDebug
> Task :react-native-async-storage_async-storage:processDebugManifest
package="com.reactnativecommunity.asyncstorage" found in source AndroidManifest.xml: /home/expo/workingdir/build/Frontend/node_modules/@react-native-async-storage/async-storage/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="com.reactnativecommunity.asyncstorage" from the source AndroidManifest.xml: /home/expo/workingdir/build/Frontend/node_modules/@react-native-async-storage/async-storage/android/src/main/AndroidManifest.xml.
> Task :react-native-gesture-handler:extractDeepLinksDebug
> Task :react-native-gesture-handler:processDebugManifest
> Task :react-native-reanimated:extractDeepLinksDebug
> Task :react-native-reanimated:processDebugManifest
> Task :react-native-safe-area-context:extractDeepLinksDebug
> Task :react-native-safe-area-context:processDebugManifest
package="com.th3rdwave.safeareacontext" found in source AndroidManifest.xml: /home/expo/workingdir/build/Frontend/node_modules/react-native-safe-area-context/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="com.th3rdwave.safeareacontext" from the source AndroidManifest.xml: /home/expo/workingdir/build/Frontend/node_modules/react-native-safe-area-context/android/src/main/AndroidManifest.xml.
> Task :react-native-screens:extractDeepLinksDebug
> Task :react-native-screens:processDebugManifest
> Task :react-native-svg:extractDeepLinksDebug
> Task :react-native-svg:processDebugManifest
> Task :react-native-voice_voice:extractDeepLinksDebug
> Task :react-native-voice_voice:processDebugManifest
package="com.wenkesj.voice" found in source AndroidManifest.xml: /home/expo/workingdir/build/Frontend/node_modules/@react-native-voice/voice/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="com.wenkesj.voice" from the source AndroidManifest.xml: /home/expo/workingdir/build/Frontend/node_modules/@react-native-voice/voice/android/src/main/AndroidManifest.xml.
> Task :react-native-worklets:extractDeepLinksDebug
> Task :react-native-worklets:processDebugManifest
> Task :react-native-worklets-core:extractDeepLinksDebug
> Task :react-native-worklets-core:processDebugManifest
package="com.worklets" found in source AndroidManifest.xml: /home/expo/workingdir/build/Frontend/node_modules/react-native-worklets-core/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="com.worklets" from the source AndroidManifest.xml: /home/expo/workingdir/build/Frontend/node_modules/react-native-worklets-core/android/src/main/AndroidManifest.xml.
> Task :shopify_react-native-skia:extractDeepLinksDebug
> Task :shopify_react-native-skia:processDebugManifest
package="com.shopify.reactnative.skia" found in source AndroidManifest.xml: /home/expo/workingdir/build/Frontend/node_modules/@shopify/react-native-skia/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="com.shopify.reactnative.skia" from the source AndroidManifest.xml: /home/expo/workingdir/build/Frontend/node_modules/@shopify/react-native-skia/android/src/main/AndroidManifest.xml.
> Task :expo:compileDebugLibraryResources
> Task :expo-constants:compileDebugLibraryResources
> Task :expo:parseDebugLocalResources
> Task :expo-constants:parseDebugLocalResources
> Task :expo-dev-client:compileDebugLibraryResources
> Task :expo-dev-client:parseDebugLocalResources
> Task :expo:generateDebugRFile
> Task :expo-dev-client:generateDebugRFile
> Task :expo-constants:generateDebugRFile
> Task :expo-dev-menu-interface:compileDebugLibraryResources
> Task :expo-dev-launcher:parseDebugLocalResources
> Task :expo-dev-menu:compileDebugLibraryResources
> Task :expo-dev-launcher:generateDebugRFile
> Task :expo-dev-launcher:compileDebugLibraryResources
> Task :expo-dev-menu-interface:parseDebugLocalResources
> Task :expo-dev-menu:parseDebugLocalResources
> Task :expo-dev-menu-interface:generateDebugRFile
> Task :expo-json-utils:compileDebugLibraryResources
> Task :expo-dev-menu:generateDebugRFile
> Task :expo-manifests:compileDebugLibraryResources
> Task :expo-json-utils:parseDebugLocalResources
> Task :expo-manifests:parseDebugLocalResources
> Task :expo-json-utils:generateDebugRFile
> Task :expo-manifests:generateDebugRFile
> Task :expo-modules-core:compileDebugLibraryResources
> Task :expo-updates-interface:compileDebugLibraryResources
> Task :expo-modules-core:parseDebugLocalResources
> Task :expo-updates-interface:parseDebugLocalResources
> Task :expo-modules-core:generateDebugRFile
> Task :expo-updates-interface:generateDebugRFile
> Task :react-native-async-storage_async-storage:compileDebugLibraryResources
> Task :react-native-async-storage_async-storage:parseDebugLocalResources
> Task :react-native-gesture-handler:compileDebugLibraryResources
> Task :react-native-async-storage_async-storage:generateDebugRFile
> Task :react-native-safe-area-context:compileDebugLibraryResources
> Task :react-native-reanimated:compileDebugLibraryResources
> Task :react-native-gesture-handler:parseDebugLocalResources
> Task :react-native-gesture-handler:generateDebugRFile
> Task :react-native-safe-area-context:parseDebugLocalResources
> Task :react-native-reanimated:parseDebugLocalResources
> Task :react-native-screens:compileDebugLibraryResources
> Task :react-native-reanimated:generateDebugRFile
> Task :react-native-safe-area-context:generateDebugRFile
> Task :react-native-screens:parseDebugLocalResources
> Task :react-native-screens:generateDebugRFile
> Task :react-native-svg:compileDebugLibraryResources
> Task :react-native-svg:parseDebugLocalResources
> Task :react-native-svg:generateDebugRFile
> Task :react-native-voice_voice:compileDebugLibraryResources
> Task :react-native-voice_voice:parseDebugLocalResources
> Task :react-native-voice_voice:generateDebugRFile
> Task :react-native-worklets-core:compileDebugLibraryResources
> Task :react-native-worklets:parseDebugLocalResources
> Task :react-native-worklets:compileDebugLibraryResources
> Task :react-native-worklets:generateDebugRFile
> Task :expo:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :react-native-worklets-core:parseDebugLocalResources
> Task :expo:generateDebugBuildConfig
> Task :shopify_react-native-skia:compileDebugLibraryResources
> Task :shopify_react-native-skia:parseDebugLocalResources
> Task :react-native-worklets-core:generateDebugRFile
> Task :expo-modules-core:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :expo-constants:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :expo-modules-core:generateDebugBuildConfig
> Task :expo-constants:generateDebugBuildConfig
> Task :shopify_react-native-skia:generateDebugRFile
> Task :expo-dev-client:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :expo-constants:javaPreCompileDebug
> Task :expo-dev-launcher:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :expo-dev-client:dataBindingMergeDependencyArtifactsDebug
> Task :app:generateAutolinkingNewArchitectureFiles
> Task :app:generateAutolinkingPackageList
> Task :app:generateCodegenSchemaFromJavaScript SKIPPED
> Task :app:generateCodegenArtifactsFromSchema SKIPPED
> Task :app:generateReactNativeEntryPoint
> Task :app:preBuild
> Task :app:preDebugBuild
> Task :app:mergeDebugNativeDebugMetadata
NO-SOURCE
> Task :app:checkKotlinGradlePluginConfigurationErrors
SKIPPED
> Task :app:generateDebugBuildConfig
> Task :expo-modules-core:javaPreCompileDebug
> Task :expo-dev-client:dataBindingGenBaseClassesDebug
> Task :expo-dev-client:generateDebugBuildConfig
> Task :expo-dev-client:javaPreCompileDebug
> Task :expo-dev-menu:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :expo-dev-menu:generateDebugBuildConfig
> Task :expo-dev-menu-interface:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :expo-dev-menu-interface:generateDebugBuildConfig
> Task :expo-dev-menu-interface:javaPreCompileDebug
> Task :expo-json-utils:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :expo-json-utils:generateDebugBuildConfig
> Task :expo-json-utils:javaPreCompileDebug
> Task :expo-manifests:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :expo-manifests:generateDebugBuildConfig
> Task :expo-manifests:javaPreCompileDebug
> Task :expo-dev-menu:javaPreCompileDebug
> Task :expo-updates-interface:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :expo-updates-interface:generateDebugBuildConfig
> Task :expo-updates-interface:javaPreCompileDebug
> Task :expo:javaPreCompileDebug
> Task :react-native-async-storage_async-storage:generateDebugBuildConfig
> Task :react-native-async-storage_async-storage:javaPreCompileDebug
> Task :app:checkDebugAarMetadata
> Task :app:generateDebugResValues
> Task :expo-dev-launcher:dataBindingMergeDependencyArtifactsDebug
> Task :app:mapDebugSourceSetPaths
> Task :app:generateDebugResources
> Task :expo-dev-launcher:dataBindingGenBaseClassesDebug
> Task :expo-dev-launcher:generateDebugBuildConfig
> Task :expo-dev-launcher:checkApolloVersions
> Task :expo-dev-launcher:generateServiceApolloOptions
> Task :expo-dev-launcher:generateServiceApolloSources
w: /home/expo/workingdir/build/Frontend/node_modules/expo-dev-launcher/android/src/main/graphql/GetBranches.graphql: (21, 11): Apollo: Use of deprecated field `runtimeVersion`
w: /home/expo/workingdir/build/Frontend/node_modules/expo-dev-launcher/android/src/main/graphql/GetBranches.graphql: (34, 3): Apollo: Variable `platform` is unused
w: /home/expo/workingdir/build/Frontend/node_modules/expo-dev-launcher/android/src/main/graphql/GetUpdates.graphql: (14, 11): Apollo: Use of deprecated field `runtimeVersion`
> Task :expo-dev-launcher:javaPreCompileDebug
> Task :react-native-gesture-handler:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :react-native-gesture-handler:generateDebugBuildConfig
> Task :react-native-reanimated:generateDebugBuildConfig
> Task :react-native-reanimated:javaPreCompileDebug
> Task :react-native-worklets:checkKotlinGradlePluginConfigurationErrors SKIPPED
> Task :react-native-worklets:generateDebugBuildConfig
> Task :react-native-worklets:compileDebugKotlin NO-SOURCE
> Task :react-native-worklets:javaPreCompileDebug
> Task :react-native-worklets:compileDebugJavaWithJavac
Note: /home/expo/workingdir/build/Frontend/node_modules/react-native-worklets/android/src/main/java/com/swmansion/worklets/WorkletsPackage.java uses unchecked or unsafe operations.
Note: Recompile with -Xlint:unchecked for details.
> Task :app:mergeDebugResources
> Task :app:packageDebugResources
> Task :react-native-async-storage_async-storage:compileDebugJavaWithJavac
Note: Some input files use or override a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
Note: /home/expo/workingdir/build/Frontend/node_modules/@react-native-async-storage/async-storage/android/src/javaPackage/java/com/reactnativecommunity/asyncstorage/AsyncStoragePackage.java uses unchecked or unsafe operations.
Note: Recompile with -Xlint:unchecked for details.
> Task :app:parseDebugLocalResources
> Task :app:createDebugCompatibleScreenManifests
> Task :app:extractDeepLinksDebug
> Task :react-native-worklets:bundleLibCompileToJarDebug
> Task :react-native-async-storage_async-storage:bundleLibCompileToJarDebug
> Task :react-native-svg:generateDebugBuildConfig
> Task :react-native-svg:javaPreCompileDebug
> Task :app:processDebugMainManifest FAILED
See https://developer.android.com/r/studio-ui/build/manifest-merger for more information about the manifest merger.
/home/expo/workingdir/build/Frontend/android/app/src/main/AndroidManifest.xml:15:3-32:17 Error:
	tools:replace specified at line:15 for attribute android:appComponentFactory, but no new value specified
/home/expo/workingdir/build/Frontend/android/app/src/main/AndroidManifest.xml Error:
	Validation failed, exiting
> Task :expo-modules-core:compileDebugKotlin
> Task :react-native-reanimated:compileDebugJavaWithJavac
Note: Some input files use or override a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
Note: Some input files use unchecked or unsafe operations.
Note: Recompile with -Xlint:unchecked for details.
> Task :react-native-svg:compileDebugJavaWithJavac
Note: Some input files use or override a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
Note: Some input files use unchecked or unsafe operations.
Note: Recompile with -Xlint:unchecked for details.
> Task :expo-modules-core:compileDebugKotlin
w: file:///home/expo/workingdir/build/Frontend/node_modules/expo-modules-core/android/src/main/java/expo/modules/adapters/react/apploader/RNHeadlessAppLoader.kt:48:87 'val reactNativeHost: ReactNativeHost' is deprecated. You should not use ReactNativeHost directly in the New Architecture. Use ReactHost instead.
w: file:///home/expo/workingdir/build/Frontend/node_modules/expo-modules-core/android/src/main/java/expo/modules/adapters/react/apploader/RNHeadlessAppLoader.kt:91:85 'val reactNativeHost: ReactNativeHost' is deprecated. You should not use ReactNativeHost directly in the New Architecture. Use ReactHost instead.
w: file:///home/expo/workingdir/build/Frontend/node_modules/expo-modules-core/android/src/main/java/expo/modules/adapters/react/apploader/RNHeadlessAppLoader.kt:120:83 'val reactNativeHost: ReactNativeHost' is deprecated. You should not use ReactNativeHost directly in the New Architecture. Use ReactHost instead.
w: file:///home/expo/workingdir/build/Frontend/node_modules/expo-modules-core/android/src/main/java/expo/modules/apploader/AppLoaderProvider.kt:34:52 Unchecked cast of 'Class<*>!' to 'Class<out HeadlessAppLoader>'.
w: file:///home/expo/workingdir/build/Frontend/node_modules/expo-modules-core/android/src/main/java/expo/modules/kotlin/AppContext.kt:30:8 'typealias ErrorManagerModule = JSLoggerModule' is deprecated. Use JSLoggerModule instead.
w: file:///home/expo/workingdir/build/Frontend/node_modules/expo-modules-core/android/src/main/java/expo/modules/kotlin/AppContext.kt:253:21 'typealias ErrorManagerModule = JSLoggerModule' is deprecated. Use JSLoggerModule instead.
w: file:///home/expo/workingdir/build/Frontend/node_modules/expo-modules-core/android/src/main/java/expo/modules/kotlin/AppContext.kt:343:21 'val DEFAULT: Int' is deprecated. UIManagerType.DEFAULT will be deleted in the next release of React Native. Use [LEGACY] instead.
w: file:///home/expo/workingdir/build/Frontend/node_modules/expo-modules-core/android/src/main/java/expo/modules/kotlin/defaultmodules/NativeModulesProxyModule.kt:16:5 'fun Constants(legacyConstantsProvider: () -> Map<String, Any?>): Unit' is deprecated. Use `Constant` or `Property` instead.
w: file:///home/expo/workingdir/build/Frontend/node_modules/expo-modules-core/android/src/main/java/expo/modules/kotlin/jni/PromiseImpl.kt:65:51 'val errorManager: JSLoggerModule?' is deprecated. Use AppContext.jsLogger instead.
w: file:///home/expo/workingdir/build/Frontend/node_modules/expo-modules-core/android/src/main/java/expo/modules/kotlin/jni/PromiseImpl.kt:69:22 'fun reportExceptionToLogBox(codedException: CodedException): Unit' is deprecated. Use appContext.jsLogger.error(...) instead.
w: file:///home/expo/workingdir/build/Frontend/node_modules/expo-modules-core/android/src/main/java/expo/modules/kotlin/views/ViewDefinitionBuilder.kt:464:16 'val errorManager: JSLoggerModule?' is deprecated. Use AppContext.jsLogger instead.
w: file:///home/expo/workingdir/build/Frontend/node_modules/expo-modules-core/android/src/main/java/expo/modules/kotlin/views/ViewDefinitionBuilder.kt:464:30 'fun reportExceptionToLogBox(codedException: CodedException): Unit' is deprecated. Use appContext.jsLogger.error(...) instead.
w: file:///home/expo/workingdir/build/Frontend/node_modules/expo-modules-core/android/src/main/java/expo/modules/kotlin/views/ViewManagerDefinition.kt:41:16 'val errorManager: JSLoggerModule?' is deprecated. Use AppContext.jsLogger instead.
w: file:///home/expo/workingdir/build/Frontend/node_modules/expo-modules-core/android/src/main/java/expo/modules/kotlin/views/ViewManagerDefinition.kt:41:30 'fun reportExceptionToLogBox(codedException: CodedException): Unit' is deprecated. Use appContext.jsLogger.error(...) instead.
[Incubating] Problems report is available at: file:///home/expo/workingdir/build/Frontend/android/build/reports/problems/problems-report.html
Deprecated Gradle features were used in this build, making it incompatible with Gradle 9.0.
You can use '--warning-mode all' to show the individual deprecation warnings and determine if they come from your own scripts or plugins.
For more on this, please refer to https://docs.gradle.org/8.14.3/userguide/command_line_interface.html#sec:command_line_warnings in the Gradle documentation.
292 actionable tasks: 292 executed
FAILURE: Build failed with an exception.
* What went wrong:
Execution failed for task ':app:processDebugMainManifest'.
> Manifest merger failed with multiple errors, see logs
* Try:
> Run with --stacktrace option to get the stack trace.
> Run with --info or --debug option to get more log output.
> Run with --scan to get full insights.
> Get more help at https://help.gradle.org.
BUILD FAILED in 3m 12s
See the profiling report at: file:///home/expo/workingdir/build/Frontend/android/build/reports/profile/profile-2026-05-23-11-45-41.html
A fine-grained performance profile is available: use the --scan option.
Error: Gradle build failed with unknown error. See logs for the "Run gradlew" phase for more information.