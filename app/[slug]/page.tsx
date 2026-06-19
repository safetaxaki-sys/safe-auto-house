import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type SeoPage = {
  title: string;
  description: string;
  h1: string;
  intro: string;
  audience: string;
  benefits: string[];
  sections: Array<{ title: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
  keywords: string[];
};

const pages: Record<string, SeoPage> = {
  "enoikiasi-taxi": {
    title: "Ενοικίαση ταξί στην Αθήνα | Safe Auto-House",
    description:
      "Ενοικίαση ταξί και συνεργασία με οδηγούς στην Αθήνα και την Αττική, με καθαρή οικονομική εικόνα, βάρδιες και υποστήριξη από τη Safe Auto-House.",
    h1: "Ενοικίαση ταξί στην Αθήνα",
    intro:
      "Η Safe Auto-House βοηθά οδηγούς ταξί να οργανώσουν τη δουλειά τους με καθαρές βάρδιες, ξεκάθαρα έσοδα και πρακτική καθημερινή υποστήριξη.",
    audience: "Για επαγγελματίες οδηγούς που αναζητούν ταξί για συνεργασία ή ενοικίαση στην Αθήνα και την Αττική.",
    benefits: [
      "Καθαρή εικόνα εσόδων, κρατήσεων και καθαρού ποσού",
      "Οργάνωση ανά εβδομάδα και ανά βάρδια",
      "Υποστήριξη για πλατφόρμες όπως FreeNow, Bolt και Uber",
      "Άμεση επικοινωνία με την εταιρεία μέσα από την εφαρμογή",
    ],
    sections: [
      {
        title: "Τι περιλαμβάνει η συνεργασία",
        body: "Ο οδηγός μπορεί να παρακολουθεί τα οικονομικά της εβδομάδας, τις κρατήσεις, τα έξοδα και το καθαρό αποτέλεσμα χωρίς σημειώσεις και μπερδέματα.",
      },
      {
        title: "Γιατί να επιλέξεις Safe Auto-House",
        body: "Η διαδικασία είναι οργανωμένη γύρω από την καθημερινότητα του οδηγού ταξί: έσοδα, πλατφόρμες, βάρδιες, ενημερώσεις και καθαρή εικόνα σε ένα σημείο.",
      },
    ],
    faqs: [
      {
        question: "Μπορώ να συνεργαστώ ως οδηγός ταξί;",
        answer: "Ναι, η σελίδα απευθύνεται σε οδηγούς που θέλουν οργανωμένη συνεργασία και ξεκάθαρη οικονομική εικόνα.",
      },
      {
        question: "Υποστηρίζονται εφαρμογές ταξί;",
        answer: "Η εφαρμογή οργανώνει στοιχεία από FreeNow, Bolt, Uber και δρόμο, ώστε ο οδηγός να βλέπει συνολικά την εβδομάδα του.",
      },
    ],
    keywords: ["ενοικίαση ταξί", "ενοικίαση ταξί Αθήνα", "ταξί για συνεργασία", "οδηγός ταξί"],
  },
  "odigos-taxi": {
    title: "Οδηγός ταξί - Συνεργασία και οργάνωση | Safe Auto-House",
    description:
      "Συνεργασία για οδηγούς ταξί με οργανωμένες βάρδιες, έσοδα, κρατήσεις, έξοδα και μηνύματα εταιρείας σε μία εφαρμογή.",
    h1: "Οδηγός ταξί με καθαρή εικόνα στα οικονομικά του",
    intro:
      "Η Safe Auto-House δίνει στον οδηγό ταξί ένα απλό περιβάλλον για να ξέρει τι έβγαλε, τι κρατήθηκε και τι μένει καθαρό.",
    audience: "Για οδηγούς ταξί που θέλουν πιο οργανωμένη συνεργασία και λιγότερα μπερδέματα στην εβδομαδιαία εκκαθάριση.",
    benefits: [
      "Έσοδα και καθαρό ποσό σε ένα σημείο",
      "Ανάλυση ανά πλατφόρμα και δρόμο",
      "Ενημερώσεις από την εταιρεία",
      "Προβολή εβδομάδας και βαρδιών",
    ],
    sections: [
      {
        title: "Οικονομικά χωρίς ασάφεια",
        body: "Ο οδηγός βλέπει ξεκάθαρα τζίρο, κρατήσεις, ΦΠΑ, ένσημα, έξοδα και καθαρό ποσό, ώστε να έχει έλεγχο της δουλειάς του.",
      },
      {
        title: "Πιο εύκολη καθημερινότητα",
        body: "Οι ανακοινώσεις, οι βάρδιες και τα οικονομικά μπαίνουν σε σειρά, ώστε να μειώνονται τα τηλέφωνα και οι χειρόγραφες σημειώσεις.",
      },
    ],
    faqs: [
      {
        question: "Η εφαρμογή είναι για οδηγούς ταξί;",
        answer: "Ναι, είναι σχεδιασμένη για οδηγούς ταξί και για εταιρική διαχείριση οδηγών.",
      },
      {
        question: "Τι βλέπει ο οδηγός;",
        answer: "Βλέπει έσοδα, έξοδα, κρατήσεις, πλατφόρμες, μηνύματα και καθαρό αποτέλεσμα εβδομάδας.",
      },
    ],
    keywords: ["οδηγός ταξί", "δουλειά οδηγός ταξί", "θέσεις οδηγών ταξί", "συνεργασία οδηγού ταξί"],
  },
  "theseis-odigon-taxi": {
    title: "Θέσεις οδηγών ταξί | Safe Auto-House",
    description:
      "Θέσεις και συνεργασίες για οδηγούς ταξί με οργανωμένη οικονομική παρακολούθηση και υποστήριξη από τη Safe Auto-House.",
    h1: "Θέσεις οδηγών ταξί και συνεργασίες",
    intro:
      "Αν αναζητάς εργασία ή συνεργασία ως οδηγός ταξί, η Safe Auto-House προσφέρει πιο οργανωμένη εικόνα της καθημερινής δουλειάς.",
    audience: "Για νέους ή έμπειρους οδηγούς ταξί που θέλουν επαγγελματική συνεργασία με ξεκάθαρη παρακολούθηση.",
    benefits: [
      "Οργανωμένες βάρδιες",
      "Εβδομαδιαία εικόνα εσόδων",
      "Καθαρό αποτέλεσμα μετά τις κρατήσεις",
      "Εταιρικές ενημερώσεις μέσα στην εφαρμογή",
    ],
    sections: [
      {
        title: "Τι χρειάζεται ένας οδηγός",
        body: "Ο οδηγός χρειάζεται ξεκάθαρη ενημέρωση, γρήγορη πρόσβαση στα στοιχεία του και πρακτική υποστήριξη για την καθημερινή βάρδια.",
      },
      {
        title: "Οργάνωση από την πρώτη εβδομάδα",
        body: "Η εφαρμογή βοηθά την εταιρεία και τον οδηγό να βλέπουν την ίδια οικονομική εικόνα, με λιγότερα λάθη και καθυστερήσεις.",
      },
    ],
    faqs: [
      {
        question: "Υπάρχουν συνεργασίες για οδηγούς ταξί;",
        answer: "Η Safe Auto-House παρουσιάζει υπηρεσίες και εργαλεία για οργανωμένη συνεργασία με οδηγούς ταξί.",
      },
      {
        question: "Πώς βοηθά η εφαρμογή;",
        answer: "Βάζει σε σειρά βάρδιες, έσοδα, κρατήσεις και ενημερώσεις, ώστε ο οδηγός να έχει καθαρή εικόνα.",
      },
    ],
    keywords: ["θέσεις οδηγών ταξί", "εργασία οδηγός ταξί", "οδηγοί ταξί Αθήνα", "δουλειά σε ταξί"],
  },
  "synergasia-odigoi-taxi": {
    title: "Συνεργασία με οδηγούς ταξί | Safe Auto-House",
    description:
      "Συνεργασία με οδηγούς ταξί, διαχείριση εβδομάδων, βαρδιών, εσόδων και ενημερώσεων μέσα από το Safe Auto-House.",
    h1: "Συνεργασία με οδηγούς ταξί",
    intro:
      "Η Safe Auto-House συνδυάζει την καθημερινή λειτουργία οδηγών ταξί με απλή ψηφιακή διαχείριση και καθαρά οικονομικά στοιχεία.",
    audience: "Για οδηγούς και διαχειριστές που θέλουν κοινή, ξεκάθαρη εικόνα σε έσοδα, βάρδιες και ενημερώσεις.",
    benefits: [
      "Κεντρική εικόνα για admin",
      "Προσωπική εικόνα για κάθε οδηγό",
      "Μηνύματα και ανακοινώσεις εταιρείας",
      "Ανάλυση εβδομάδας με καθαρό ποσό",
    ],
    sections: [
      {
        title: "Για οδηγούς",
        body: "Ο οδηγός βλέπει τα δικά του στοιχεία χωρίς να ψάχνει χαρτιά, μηνύματα ή ξεχωριστές σημειώσεις.",
      },
      {
        title: "Για διαχειριστές",
        body: "Ο admin οργανώνει οδηγούς, εβδομάδες, υπόλοιπα και ενημερώσεις σε ένα κεντρικό περιβάλλον.",
      },
    ],
    faqs: [
      {
        question: "Υπάρχει ξεχωριστή είσοδος οδηγού και admin;",
        answer: "Ναι, η εφαρμογή υποστηρίζει Driver App και Admin Portal με διαφορετική εικόνα για κάθε ρόλο.",
      },
      {
        question: "Είναι χρήσιμο για στόλο ταξί;",
        answer: "Ναι, βοηθά στην οργάνωση οδηγών, εβδομάδων, οικονομικών στοιχείων και ενημερώσεων.",
      },
    ],
    keywords: ["συνεργασία οδηγοί ταξί", "διαχείριση ταξί", "στόλος ταξί", "admin ταξί"],
  },
};

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = pages[slug];

  if (!page) {
    return { title: "Safe Auto-House" };
  }

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: "/" + slug },
    openGraph: {
      title: page.title,
      description: page.description,
      url: "/" + slug,
      siteName: "Safe Auto-House",
      locale: "el_GR",
      type: "website",
    },
  };
}

export default async function SeoLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = pages[slug];

  if (!page) notFound();

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="border-b border-[#E8B858]/20 bg-black px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-[#E8B858]">
            <img src="/logo.png" alt="Safe Auto-House" className="h-10 w-10 rounded-lg object-contain" />
            Safe Auto-House
          </Link>
          <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-base font-bold text-[#F0C060]">Ταξί, οδηγοί και οργανωμένη συνεργασία</p>
              <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{page.h1}</h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">{page.intro}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/" className="rounded-xl bg-[#E8B858] px-5 py-3 text-base font-black text-black hover:bg-[#F0C060]">
                  Άνοιγμα εφαρμογής
                </Link>
                <a href="mailto:info@example.com" className="rounded-xl border border-[#E8B858]/40 px-5 py-3 text-base font-black text-[#F0C060] hover:bg-[#E8B858]/10">
                  Επικοινωνία
                </a>
              </div>
            </div>
            <div className="rounded-2xl border border-[#E8B858]/25 bg-zinc-950 p-6 shadow-2xl shadow-black/40">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-zinc-500">Για ποιους είναι</p>
              <p className="mt-4 text-xl font-bold leading-8 text-white">{page.audience}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-4">
          {page.benefits.map((benefit) => (
            <div key={benefit} className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-base font-bold leading-7 text-zinc-100">{benefit}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pb-14 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          {page.sections.map((section) => (
            <article key={section.title} className="rounded-xl border border-zinc-800 bg-black p-6">
              <h2 className="text-2xl font-black text-[#F0C060]">{section.title}</h2>
              <p className="mt-4 text-base leading-8 text-zinc-300">{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-zinc-900 px-5 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-black">Συχνές ερωτήσεις</h2>
          <div className="mt-6 space-y-4">
            {page.faqs.map((faq) => (
              <article key={faq.question} className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                <h3 className="text-lg font-black text-white">{faq.question}</h3>
                <p className="mt-3 text-base leading-7 text-zinc-300">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type SeoPage = {
  title: string;
  description: string;
  h1: string;
  intro: string;
  audience: string;
  benefits: string[];
  sections: Array<{ title: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
  keywords: string[];
};

const pages: Record<string, SeoPage> = {
  "enoikiasi-taxi": {
    title: "Ενοικίαση ταξί στην Αθήνα | Safe Auto-House",
    description:
      "Ενοικίαση ταξί και συνεργασία με οδηγούς στην Αθήνα και την Αττική, με καθαρή οικονομική εικόνα, βάρδιες και υποστήριξη από τη Safe Auto-House.",
    h1: "Ενοικίαση ταξί στην Αθήνα",
    intro:
      "Η Safe Auto-House βοηθά οδηγούς ταξί να οργανώσουν τη δουλειά τους με καθαρές βάρδιες, ξεκάθαρα έσοδα και πρακτική καθημερινή υποστήριξη.",
    audience: "Για επαγγελματίες οδηγούς που αναζητούν ταξί για συνεργασία ή ενοικίαση στην Αθήνα και την Αττική.",
    benefits: [
      "Καθαρή εικόνα εσόδων, κρατήσεων και καθαρού ποσού",
      "Οργάνωση ανά εβδομάδα και ανά βάρδια",
      "Υποστήριξη για πλατφόρμες όπως FreeNow, Bolt και Uber",
      "Άμεση επικοινωνία με την εταιρεία μέσα από την εφαρμογή",
    ],
    sections: [
      {
        title: "Τι περιλαμβάνει η συνεργασία",
        body: "Ο οδηγός μπορεί να παρακολουθεί τα οικονομικά της εβδομάδας, τις κρατήσεις, τα έξοδα και το καθαρό αποτέλεσμα χωρίς σημειώσεις και μπερδέματα.",
      },
      {
        title: "Γιατί να επιλέξεις Safe Auto-House",
        body: "Η διαδικασία είναι οργανωμένη γύρω από την καθημερινότητα του οδηγού ταξί: έσοδα, πλατφόρμες, βάρδιες, ενημερώσεις και καθαρή εικόνα σε ένα σημείο.",
      },
    ],
    faqs: [
      {
        question: "Μπορώ να συνεργαστώ ως οδηγός ταξί;",
        answer: "Ναι, η σελίδα απευθύνεται σε οδηγούς που θέλουν οργανωμένη συνεργασία και ξεκάθαρη οικονομική εικόνα.",
      },
      {
        question: "Υποστηρίζονται εφαρμογές ταξί;",
        answer: "Η εφαρμογή οργανώνει στοιχεία από FreeNow, Bolt, Uber και δρόμο, ώστε ο οδηγός να βλέπει συνολικά την εβδομάδα του.",
      },
    ],
    keywords: ["ενοικίαση ταξί", "ενοικίαση ταξί Αθήνα", "ταξί για συνεργασία", "οδηγός ταξί"],
  },
  "odigos-taxi": {
    title: "Οδηγός ταξί - Συνεργασία και οργάνωση | Safe Auto-House",
    description:
      "Συνεργασία για οδηγούς ταξί με οργανωμένες βάρδιες, έσοδα, κρατήσεις, έξοδα και μηνύματα εταιρείας σε μία εφαρμογή.",
    h1: "Οδηγός ταξί με καθαρή εικόνα στα οικονομικά του",
    intro:
      "Η Safe Auto-House δίνει στον οδηγό ταξί ένα απλό περιβάλλον για να ξέρει τι έβγαλε, τι κρατήθηκε και τι μένει καθαρό.",
    audience: "Για οδηγούς ταξί που θέλουν πιο οργανωμένη συνεργασία και λιγότερα μπερδέματα στην εβδομαδιαία εκκαθάριση.",
    benefits: [
      "Έσοδα και καθαρό ποσό σε ένα σημείο",
      "Ανάλυση ανά πλατφόρμα και δρόμο",
      "Ενημερώσεις από την εταιρεία",
      "Προβολή εβδομάδας και βαρδιών",
    ],
    sections: [
      {
        title: "Οικονομικά χωρίς ασάφεια",
        body: "Ο οδηγός βλέπει ξεκάθαρα τζίρο, κρατήσεις, ΦΠΑ, ένσημα, έξοδα και καθαρό ποσό, ώστε να έχει έλεγχο της δουλειάς του.",
      },
      {
        title: "Πιο εύκολη καθημερινότητα",
        body: "Οι ανακοινώσεις, οι βάρδιες και τα οικονομικά μπαίνουν σε σειρά, ώστε να μειώνονται τα τηλέφωνα και οι χειρόγραφες σημειώσεις.",
      },
    ],
    faqs: [
      {
        question: "Η εφαρμογή είναι για οδηγούς ταξί;",
        answer: "Ναι, είναι σχεδιασμένη για οδηγούς ταξί και για εταιρική διαχείριση οδηγών.",
      },
      {
        question: "Τι βλέπει ο οδηγός;",
        answer: "Βλέπει έσοδα, έξοδα, κρατήσεις, πλατφόρμες, μηνύματα και καθαρό αποτέλεσμα εβδομάδας.",
      },
    ],
    keywords: ["οδηγός ταξί", "δουλειά οδηγός ταξί", "θέσεις οδηγών ταξί", "συνεργασία οδηγού ταξί"],
  },
  "theseis-odigon-taxi": {
    title: "Θέσεις οδηγών ταξί | Safe Auto-House",
    description:
      "Θέσεις και συνεργασίες για οδηγούς ταξί με οργανωμένη οικονομική παρακολούθηση και υποστήριξη από τη Safe Auto-House.",
    h1: "Θέσεις οδηγών ταξί και συνεργασίες",
    intro:
      "Αν αναζητάς εργασία ή συνεργασία ως οδηγός ταξί, η Safe Auto-House προσφέρει πιο οργανωμένη εικόνα της καθημερινής δουλειάς.",
    audience: "Για νέους ή έμπειρους οδηγούς ταξί που θέλουν επαγγελματική συνεργασία με ξεκάθαρη παρακολούθηση.",
    benefits: [
      "Οργανωμένες βάρδιες",
      "Εβδομαδιαία εικόνα εσόδων",
      "Καθαρό αποτέλεσμα μετά τις κρατήσεις",
      "Εταιρικές ενημερώσεις μέσα στην εφαρμογή",
    ],
    sections: [
      {
        title: "Τι χρειάζεται ένας οδηγός",
        body: "Ο οδηγός χρειάζεται ξεκάθαρη ενημέρωση, γρήγορη πρόσβαση στα στοιχεία του και πρακτική υποστήριξη για την καθημερινή βάρδια.",
      },
      {
        title: "Οργάνωση από την πρώτη εβδομάδα",
        body: "Η εφαρμογή βοηθά την εταιρεία και τον οδηγό να βλέπουν την ίδια οικονομική εικόνα, με λιγότερα λάθη και καθυστερήσεις.",
      },
    ],
    faqs: [
      {
        question: "Υπάρχουν συνεργασίες για οδηγούς ταξί;",
        answer: "Η Safe Auto-House παρουσιάζει υπηρεσίες και εργαλεία για οργανωμένη συνεργασία με οδηγούς ταξί.",
      },
      {
        question: "Πώς βοηθά η εφαρμογή;",
        answer: "Βάζει σε σειρά βάρδιες, έσοδα, κρατήσεις και ενημερώσεις, ώστε ο οδηγός να έχει καθαρή εικόνα.",
      },
    ],
    keywords: ["θέσεις οδηγών ταξί", "εργασία οδηγός ταξί", "οδηγοί ταξί Αθήνα", "δουλειά σε ταξί"],
  },
  "synergasia-odigoi-taxi": {
    title: "Συνεργασία με οδηγούς ταξί | Safe Auto-House",
    description:
      "Συνεργασία με οδηγούς ταξί, διαχείριση εβδομάδων, βαρδιών, εσόδων και ενημερώσεων μέσα από το Safe Auto-House.",
    h1: "Συνεργασία με οδηγούς ταξί",
    intro:
      "Η Safe Auto-House συνδυάζει την καθημερινή λειτουργία οδηγών ταξί με απλή ψηφιακή διαχείριση και καθαρά οικονομικά στοιχεία.",
    audience: "Για οδηγούς και διαχειριστές που θέλουν κοινή, ξεκάθαρη εικόνα σε έσοδα, βάρδιες και ενημερώσεις.",
    benefits: [
      "Κεντρική εικόνα για admin",
      "Προσωπική εικόνα για κάθε οδηγό",
      "Μηνύματα και ανακοινώσεις εταιρείας",
      "Ανάλυση εβδομάδας με καθαρό ποσό",
    ],
    sections: [
      {
        title: "Για οδηγούς",
        body: "Ο οδηγός βλέπει τα δικά του στοιχεία χωρίς να ψάχνει χαρτιά, μηνύματα ή ξεχωριστές σημειώσεις.",
      },
      {
        title: "Για διαχειριστές",
        body: "Ο admin οργανώνει οδηγούς, εβδομάδες, υπόλοιπα και ενημερώσεις σε ένα κεντρικό περιβάλλον.",
      },
    ],
    faqs: [
      {
        question: "Υπάρχει ξεχωριστή είσοδος οδηγού και admin;",
        answer: "Ναι, η εφαρμογή υποστηρίζει Driver App και Admin Portal με διαφορετική εικόνα για κάθε ρόλο.",
      },
      {
        question: "Είναι χρήσιμο για στόλο ταξί;",
        answer: "Ναι, βοηθά στην οργάνωση οδηγών, εβδομάδων, οικονομικών στοιχείων και ενημερώσεων.",
      },
    ],
    keywords: ["συνεργασία οδηγοί ταξί", "διαχείριση ταξί", "στόλος ταξί", "admin ταξί"],
  },
};

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const page = pages[params.slug];

  if (!page) {
    return { title: "Safe Auto-House" };
  }

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: "/" + params.slug },
    openGraph: {
      title: page.title,
      description: page.description,
      url: "/" + params.slug,
      siteName: "Safe Auto-House",
      locale: "el_GR",
      type: "website",
    },
  };
}

export default function SeoLandingPage({ params }: { params: { slug: string } }) {
  const page = pages[params.slug];

  if (!page) notFound();

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="border-b border-[#E8B858]/20 bg-black px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-[#E8B858]">
            <img src="/logo.png" alt="Safe Auto-House" className="h-10 w-10 rounded-lg object-contain" />
            Safe Auto-House
          </Link>
          <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-base font-bold text-[#F0C060]">Ταξί, οδηγοί και οργανωμένη συνεργασία</p>
              <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{page.h1}</h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">{page.intro}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/" className="rounded-xl bg-[#E8B858] px-5 py-3 text-base font-black text-black hover:bg-[#F0C060]">
                  Άνοιγμα εφαρμογής
                </Link>
                <a href="mailto:info@example.com" className="rounded-xl border border-[#E8B858]/40 px-5 py-3 text-base font-black text-[#F0C060] hover:bg-[#E8B858]/10">
                  Επικοινωνία
                </a>
              </div>
            </div>
            <div className="rounded-2xl border border-[#E8B858]/25 bg-zinc-950 p-6 shadow-2xl shadow-black/40">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-zinc-500">Για ποιους είναι</p>
              <p className="mt-4 text-xl font-bold leading-8 text-white">{page.audience}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-4">
          {page.benefits.map((benefit) => (
            <div key={benefit} className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-base font-bold leading-7 text-zinc-100">{benefit}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pb-14 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          {page.sections.map((section) => (
            <article key={section.title} className="rounded-xl border border-zinc-800 bg-black p-6">
              <h2 className="text-2xl font-black text-[#F0C060]">{section.title}</h2>
              <p className="mt-4 text-base leading-8 text-zinc-300">{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-zinc-900 px-5 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-black">Συχνές ερωτήσεις</h2>
          <div className="mt-6 space-y-4">
            {page.faqs.map((faq) => (
              <article key={faq.question} className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                <h3 className="text-lg font-black text-white">{faq.question}</h3>
                <p className="mt-3 text-base leading-7 text-zinc-300">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
