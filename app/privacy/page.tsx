export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <section className="mx-auto max-w-3xl rounded-2xl border border-[#E8B858]/30 bg-zinc-950 p-6">
        <p className="text-sm font-black uppercase tracking-wide text-[#F0C060]">
          Safe Auto-House
        </p>
        <h1 className="mt-3 text-3xl font-black">Πολιτική απορρήτου</h1>
        <div className="mt-6 space-y-4 text-zinc-300">
          <p>
            Η εφαρμογή Safe Auto-House χρησιμοποιείται για τη διαχείριση οδηγών,
            στόλου, οικονομικών εβδομάδας, ανακοινώσεων και συνεργασιών.
          </p>
          <p>
            Μπορεί να αποθηκεύονται στοιχεία όπως ονοματεπώνυμο, email,
            τηλέφωνο, πινακίδα, στοιχεία άδειας, ημερήσια έσοδα και δεδομένα
            συνεργασίας.
          </p>
          <p>
            Τα δεδομένα χρησιμοποιούνται μόνο για την οργάνωση της συνεργασίας
            οδηγού και εταιρείας. Η τελική πολιτική θα συμπληρωθεί με τα πλήρη
            στοιχεία της εταιρείας πριν τη δημοσίευση σε App Store ή Google
            Play.
          </p>
        </div>
      </section>
    </main>
  );
}
