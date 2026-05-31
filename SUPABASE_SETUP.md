# Safe Auto-House Supabase Setup

Αυτό είναι το πρώτο βήμα για να γίνει η εφαρμογή ζωντανή με πραγματική βάση.

## 1. Δημιουργία Supabase project

1. Μπες στο https://supabase.com
2. Φτιάξε νέο project.
3. Κράτα από `Project Settings > API`:
   - `Project URL`
   - `anon public key`

## 2. Περιβάλλον εφαρμογής

Δημιούργησε αρχείο `.env.local` στη ρίζα του project:

```env
NEXT_PUBLIC_SUPABASE_URL=το_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=το_anon_public_key
```

## 3. Βάση δεδομένων

Στο Supabase:

1. Άνοιξε `SQL Editor`.
2. Κάνε paste όλο το περιεχόμενο του `supabase-schema.sql`.
3. Πάτα `Run`.

## 4. Authentication

Στο Supabase Authentication:

1. Ενεργοποίησε email/password sign in.
2. Πρόσθεσε έναν πρώτο admin χρήστη.
3. Μετά τον admin χρήστη, θα χρειαστεί να δημιουργηθεί αντίστοιχο row στον πίνακα `profiles`.

Παράδειγμα για admin profile:

```sql
insert into public.profiles (id, role, first_name, last_name, email, tax_number)
values (
  'AUTH_USER_ID_FROM_SUPABASE',
  'admin',
  'Safe',
  'Auto-House',
  'admin@email.com',
  '123456789'
);
```

## 5. Επόμενο βήμα στο code

Μετά το setup:

1. Συνδέουμε το login της εφαρμογής με `supabase.auth.signInWithPassword`.
2. Φορτώνουμε το profile του χρήστη από τον πίνακα `profiles`.
3. Αν είναι admin, φορτώνουμε τους οδηγούς του.
4. Αν είναι driver, φορτώνουμε μόνο τα δικά του δεδομένα.
