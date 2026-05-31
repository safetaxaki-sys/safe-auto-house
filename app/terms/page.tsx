export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <section className="mx-auto max-w-3xl rounded-2xl border border-[#E8B858]/30 bg-zinc-950 p-6">
        <p className="text-sm font-black uppercase tracking-wide text-[#F0C060]">
          Safe Auto-House
        </p>
        <h1 className="mt-3 text-3xl font-black">Όροι χρήσης</h1>
        <div className="mt-6 space-y-4 text-zinc-300">
          <p>
            Η εφαρμογή παρέχεται για εσωτερική οργάνωση οδηγών, διαχειριστών,
            στόλου και οικονομικών δεδομένων της Safe Auto-House.
          </p>
          <p>
            Οι χρήστες οφείλουν να καταχωρούν αληθή στοιχεία και να μη
            μοιράζονται τους κωδικούς πρόσβασης με τρίτους.
          </p>
          <p>
            Τα οικονομικά στοιχεία που εμφανίζονται στην εφαρμογή έχουν σκοπό
            την ενημέρωση και την οργάνωση της συνεργασίας. Η τελική συμφωνία
            συνεργασίας γίνεται πάντα σύμφωνα με τους όρους που έχουν συμφωνηθεί
            με την εταιρεία.
          </p>
        </div>
      </section>
    </main>
  );
}
