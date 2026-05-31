# Safe Auto-House Mobile App Setup

Η εφαρμογή είναι Next.js web app και γίνεται mobile app με Capacitor.

## Τι υπάρχει ήδη

- `capacitor.config.ts`
- PWA manifest
- app icons
- Privacy page: `/privacy`
- Terms page: `/terms`
- Android scripts στο `package.json`

## Android

Για να δημιουργηθεί Android project:

```bash
npm run mobile:add:android
npm run mobile:sync
npm run mobile:android
```

Για να ανοίξει το Android project χρειάζεται Android Studio.

## iPhone / App Store

Το iOS project φτιάχνεται μόνο σε Mac με Xcode:

```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

## Production URL

Το mobile app είναι ρυθμισμένο να ανοίγει:

```text
https://app.safeautohouse.com
```

Πριν τα stores πρέπει:

1. Να ανέβει η εφαρμογή σε Vercel.
2. Να συνδεθεί το domain/subdomain.
3. Να δουλεύει το Supabase login online.
4. Να ελεγχθούν Privacy και Terms με τα πραγματικά στοιχεία εταιρείας.
