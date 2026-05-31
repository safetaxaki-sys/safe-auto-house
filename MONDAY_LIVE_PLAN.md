# Monday Live Plan

Στόχος: να υπάρχει live link για παρουσίαση τη Δευτέρα.

## Γρήγορη live έκδοση για παρουσίαση

Η εφαρμογή μπορεί να ανέβει online ακόμα και πριν ολοκληρωθεί όλο το Supabase
data migration, επειδή έχει demo fallback login.

Demo credentials:

```text
Admin: admin@safeauto.gr / admin123
Driver: driver@safeauto.gr / driver123
```

## Βήματα για live link

1. Push το project στο GitHub remote:

```bash
git add .
git commit -m "Prepare app for live demo"
git push origin main
```

2. Vercel:
   - Login στο https://vercel.com
   - New Project
   - Import από GitHub: `safetaxaki-sys/safe-auto-house`
   - Framework: Next.js
   - Build command: `npm run build`
   - Deploy

3. Domain:
   - Στο Vercel project > Domains
   - Πρόσθεσε `app.safeautohouse.com`
   - Στο DNS του domain βάλε το record που θα δώσει το Vercel.

## Supabase για πραγματικά accounts

Για τη Δευτέρα, αν ο στόχος είναι παρουσίαση, μπορεί να ξεκινήσει με demo login.
Για πραγματική χρήση οδηγών:

1. Δημιουργία Supabase project.
2. SQL Editor > paste `supabase-schema.sql`.
3. Authentication > δημιουργία admin χρήστη.
4. Project Settings > API > αντιγραφή:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Vercel > Project Settings > Environment Variables > προσθήκη των δύο keys.
6. Redeploy.

## Mobile demo

Μέχρι να εγκριθεί Google Play / App Store:

- Android/iPhone ανοίγουν το Vercel link.
- Από browser γίνεται `Add to Home Screen`.
- Η εφαρμογή ανοίγει σαν PWA.

Το native Android project υπάρχει ήδη στο `android/`, για επόμενο στάδιο Google Play.
