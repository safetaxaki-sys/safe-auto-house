export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <div className="max-w-md rounded-2xl border border-[#E8B858]/30 bg-zinc-950 p-6 text-center">
        <p className="text-sm font-black uppercase tracking-wide text-[#F0C060]">
          Safe Auto-House
        </p>
        <h1 className="mt-3 text-3xl font-black">Δεν υπάρχει σύνδεση</h1>
        <p className="mt-3 text-zinc-400">
          Η εφαρμογή χρειάζεται internet για να συγχρονίσει τα πραγματικά
          δεδομένα οδηγών και εταιρείας. Δοκίμασε ξανά μόλις επανέλθει η
          σύνδεση.
        </p>
      </div>
    </main>
  );
}
