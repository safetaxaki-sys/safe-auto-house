# Safe Auto-House Production Checklist

## Τρέχουσα κατάσταση

- Η εφαρμογή τρέχει τοπικά.
- Υπάρχει Supabase schema.
- Υπάρχει Supabase client.
- Υπάρχει PWA manifest.
- Υπάρχουν βασικές σελίδες Privacy και Terms.
- Το login έχει fallback demo mode και είναι έτοιμο για Supabase Auth.

## Για να βγει online

1. Δημιουργία Supabase project.
2. Εκτέλεση `supabase-schema.sql` στο Supabase SQL Editor.
3. Δημιουργία πρώτου admin user στο Supabase Auth.
4. Δημιουργία row στον πίνακα `profiles` για τον admin.
5. Δημιουργία `.env.local` με:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

6. Deploy σε Vercel.
7. Προσθήκη των ίδιων env variables στο Vercel project.
8. Σύνδεση domain, π.χ. `app.safeautohouse.com`.

## Για mobile app

### Γρήγορη έκδοση

Χρήση ως PWA:

- Ο χρήστης ανοίγει το link από κινητό.
- Πατάει “Add to Home Screen”.
- Η εφαρμογή ανοίγει σαν κανονικό app.

### Store έκδοση

1. Το Capacitor έχει προστεθεί στο project.
2. Δημιουργία Android project:

```bash
npm run mobile:add:android
npm run mobile:sync
npm run mobile:android
```

3. Δημιουργία iOS project γίνεται σε Mac:

```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

4. App icons / splash screens.
5. Google Play Console account.
6. Apple Developer account.
7. Υποβολή Privacy Policy και Terms URLs.
8. Store submission.

Σημείωση: το Capacitor app είναι ρυθμισμένο να δείχνει στο
`https://app.safeautohouse.com`. Όταν ανέβει το Vercel/domain, αυτό πρέπει να
είναι το τελικό link της εφαρμογής.

## Πριν μπει σε πραγματική εταιρική χρήση

- Να μεταφερθούν όλες οι καρτέλες από `localStorage` σε Supabase.
- Να μπουν πραγματικά Supabase Auth accounts.
- Να φτιαχτεί σωστό Excel import με σταθερό column mapping.
- Να προστεθεί Supabase Storage για φωτογραφίες και αρχεία.
- Να ελεγχθούν οι RLS policies με test admin και test driver.
