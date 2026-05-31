# Android Release Build

Για να ανεβεί η εφαρμογή στο Google Play χρειάζεται αρχείο `.aab`.

## Τι είναι ήδη έτοιμο

- Android project: `android/`
- Package name: `com.safeautohouse.portal`
- App name: `Safe Auto-House`
- App icon / splash screen
- Internet permission
- Production URL στο Capacitor: `https://app.safeautohouse.com`
- Google Play listing draft: `GOOGLE_PLAY_LISTING.md`

## Τι λείπει στο μηχάνημα

Αυτή τη στιγμή λείπουν:

- Java / JDK
- Android Studio
- Android SDK

Χωρίς αυτά το Gradle εμφανίζει:

```text
ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
```

## Εγκατάσταση

1. Εγκατάσταση Android Studio:
   https://developer.android.com/studio

2. Μέσα από Android Studio εγκατάσταση:
   - Android SDK
   - Android SDK Platform
   - Android SDK Build-Tools
   - Android Emulator, αν θέλεις δοκιμή σε emulator

3. Εγκατάσταση JDK αν δεν μπει αυτόματα με Android Studio.

## Build command

Μετά την εγκατάσταση:

```bash
npm run mobile:sync
cd android
gradlew.bat bundleRelease
```

Το `.aab` θα βγει εδώ:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

## Google Play Console

1. Δημιουργία λογαριασμού:
   https://play.google.com/console

2. Πληρωμή one-time fee.

3. Δημιουργία νέας εφαρμογής.

4. Συμπλήρωση:
   - App name: Safe Auto-House
   - Category: Business
   - Privacy Policy URL: https://safe-auto-house.vercel.app/privacy
   - Terms URL: https://safe-auto-house.vercel.app/terms
   - Demo login από `GOOGLE_PLAY_LISTING.md`

5. Upload του `.aab`.

## Σημαντικό

Για public release, καλό είναι πρώτα να ανέβει σε `Internal testing` ή
`Closed testing`, όχι κατευθείαν production.
