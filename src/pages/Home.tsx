// src/pages/Home.tsx
import { Link } from "react-router-dom";
import {
  Coffee,
  Camera,
  UploadCloud,
  Sparkles,
  Heart,
  Users,
  Briefcase,
  Star,
  ArrowRight,
  Quote,
  BookOpen,
  Feathers,
  MessageSquare,
} from "lucide-react";

/**
 * Απλές mock εγγραφές για το blog section
 * (Αν έχεις πραγματικές διαδρομές/σελίδες, άλλαξε τα links)
 */
const blogPosts = [
  {
    id: 1,
    title:
      "Η Αρχαία Τέχνη της Τασσομαντείας: Διαβάζοντας το Μέλλον στα Φύλλα Τσαγιού και το Κατακάθι του Καφέ",
    excerpt:
      "Εξερευνώντας την πλούσια ιστορία της μαντείας, τις μεθόδους και τα σύμβολα που κρύβονται στο φλιτζάνι.",
    to: "/blog/tassomanteia",
  },
  {
    id: 2,
    title:
      "Κοινά Σύμβολα στην Καφεμαντεία και οι Σημασίες τους",
    excerpt:
      "Ενας οδηγός για τα πιο κοινά σύμβολα που βρίσκονται στο κατακάθι του καφέ και τι σημαίνουν για τη ζωή σου.",
    to: "/blog/symbols",
  },
  {
    id: 3,
    title:
      "Γεφυρώνοντας Κόσμους: Πώς η ΑΙ Ενισχύει την Παραδοσιακή Καφεμαντεία",
    excerpt:
      "Πώς η Ai Kafetzou αξιοποιεί την τεχνητή νοημοσύνη για βαθύτερες, στοχευμένες ερμηνείες.",
    to: "/blog/ai-and-tradition",
  },
];

export default function Home() {
  return (
    <div className="bg-white text-gray-800">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-purple-800 to-purple-700 opacity-90" />
        <div className="relative z-10">
          <div className="container mx-auto max-w-6xl px-4 py-20 md:py-28 text-center text-white">
            <div className="mb-6 flex justify-center">
              <Coffee className="h-14 w-14 text-purple-200 drop-shadow-lg" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Ai Kafetzou
            </h1>
            <p className="mt-4 text-purple-100 md:text-lg">
              Ξεκλείδωσε την αρχαία τέχνη της καφεμαντείας με τη δύναμη του Ai.
              Το πεπρωμένο σου σε περιμένει σε κάθε στρόβιλο.
            </p>

            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                to="/cup"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-purple-700 shadow-lg transition hover:bg-purple-50"
              >
                Διάβασε το φλιτζάνι σου τώρα
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/demo"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 font-medium text-white transition hover:bg-white/10"
              >
                Δες Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 ΒΗΜΑΤΑ */}
      <section className="container mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-2xl md:text-3xl font-serif font-bold text-purple-900">
          Ανακάλυψε το Πεπρωμένο Σου
        </h2>
        <p className="mt-2 text-center text-gray-600">
          Ακολούθησε αυτά τα απλά βήματα για να αποκαλύψεις τα μυστικά που
          κρύβονται στο φλιτζάνι του καφέ σου.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Camera className="h-6 w-6 text-purple-700" />
            </div>
            <h3 className="text-lg font-semibold">1. Φωτογράφισε το Φλιτζάνι</h3>
            <p className="mt-2 text-gray-600">
              Ανέβασε καθαρή φωτογραφία ώστε να αναγνωρίσουμε καθαρά τα σύμβολα.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <UploadCloud className="h-6 w-6 text-purple-700" />
            </div>
            <h3 className="text-lg font-semibold">2. Ανέβασέ το Εύκολα</h3>
            <p className="mt-2 text-gray-600">
              Η πλατφόρμα μας αναλύει με ακρίβεια τα μοτίβα και τα σχήματα.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Sparkles className="h-6 w-6 text-purple-700" />
            </div>
            <h3 className="text-lg font-semibold">3. Λάβε τον Χρησμό</h3>
            <p className="mt-2 text-gray-600">
              Παρέχουμε ζεστό, ενθαρρυντικό λόγο με σύνεση—σαν παραδοσιακή
              καφετζού, με τη βοήθεια του Ai.
            </p>
          </div>
        </div>
      </section>

      {/* ΘΕΜΑΤΙΚΕΣ ΕΝΟΤΗΤΕΣ */}
      <section className="bg-purple-50/60">
        <div className="container mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-center text-2xl md:text-3xl font-serif font-bold text-purple-900">
            Ξεκλείδωσε την Αρχαία Σοφία
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Επιλογές ανά θεματική—διάλεξε αυτό που σε απασχολεί περισσότερο.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-4">
            <CategoryCard
              icon={<Heart className="h-6 w-6 text-pink-600" />}
              title="Έρωτας & Σχέσεις"
              to="/cup"
            />
            <CategoryCard
              icon={<Users className="h-6 w-6 text-emerald-600" />}
              title="Οικογενειακά Θέματα"
              to="/cup"
            />
            <CategoryCard
              icon={<Briefcase className="h-6 w-6 text-blue-600" />}
              title="Επαγγελματικά"
              to="/cup"
            />
            <CategoryCard
              icon={<Star className="h-6 w-6 text-amber-600" />}
              title="Τύχη"
              to="/cup"
            />
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="relative bg-purple-900 text-purple-50">
        <div className="container mx-auto max-w-5xl px-4 py-16">
          <div className="rounded-2xl border border-purple-700 bg-purple-800/40 p-8">
            <div className="mb-4 flex items-center gap-2">
              <Quote className="h-5 w-5 text-purple-200" />
              <span className="text-sm uppercase tracking-wider text-purple-200/80">
                Ψίθυροι από το Φλιτζάνι
              </span>
            </div>
            <p className="text-lg leading-relaxed text-purple-100">
              «Ένα ελικοειδές μονοπάτι εμφανίζεται, οδηγώντας σε μια
              απροσδόκητη πόρτα. Αλλαγές στην καρδιά διαφαίνονται, φαινομενικές
              προκλήσεις αλλά και μεγάλη ανταμοιβή. Στα σκαλοπάτια, ένα σημάδι
              δείχνει ότι νικάς τον δισταγμό. Φρόντισε την ισορροπία σου—η διαύγεια
              περιμένει στην κορυφή του βουνού.»
            </p>
            <div className="mt-4 text-right text-sm text-purple-200/80">
              — Ένας Χρησμός της Ai Kafetzou
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-2xl md:text-3xl font-serif font-bold text-purple-900">
          Επίλεξε το Μονοπάτι σου προς τη Διαύγεια
        </h2>
        <p className="mt-2 text-center text-gray-600">
          Ξεκίνα με δωρεάν ανάγνωση ή κάνε αναβάθμιση σε premium.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/cup"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-medium text-white shadow transition hover:bg-purple-700"
          >
            Ξεκίνα Δωρεάν
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 rounded-lg border border-purple-200 px-6 py-3 font-medium text-purple-700 transition hover:bg-purple-50"
          >
            Δες τα Πακέτα
          </Link>
        </div>
      </section>

      {/* BLOG PREVIEWS */}
      <section className="bg-gradient-to-b from-white to-purple-50/60">
        <div className="container mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-center text-2xl md:text-3xl font-serif font-bold text-purple-900">
            Από το Blog της Μάντισσας
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Εξερευνώντας άρθρα για την καφεμαντεία, τα σύμβολα και τις μυστικιστικές τέχνες.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {blogPosts.map((p) => (
              <article
                key={p.id}
                className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex items-center gap-3 text-purple-700">
                  {p.id === 1 ? (
                    <Feathers className="h-5 w-5" />
                  ) : p.id === 2 ? (
                    <BookOpen className="h-5 w-5" />
                  ) : (
                    <MessageSquare className="h-5 w-5" />
                  )}
                  <span className="text-sm font-medium">Άρθρο</span>
                </div>
                <h3 className="text-lg font-semibold leading-snug text-gray-900 group-hover:text-purple-700">
                  {p.title}
                </h3>
                <p className="mt-2 text-gray-600">{p.excerpt}</p>
                <div className="mt-4">
                  <Link
                    to={p.to}
                    className="inline-flex items-center gap-1 text-purple-700 hover:text-purple-800"
                  >
                    Διάβασε Περισσότερα
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/** Μικρή βοηθητική κάρτα για τις θεματικές ενότητες */
function CategoryCard({
  icon,
  title,
  to,
}: {
  icon: React.ReactNode;
  title: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/60 ring-1 ring-purple-100">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-gray-900 group-hover:text-purple-700">
        {title}
      </h3>
      <p className="mt-2 text-sm text-gray-600">
        Προσωποποιημένες αναγνώσεις με ζεστό, ενθαρρυντικό τόνο.
      </p>
      <div className="mt-3 inline-flex items-center gap-1 text-sm text-purple-700">
        Προχώρησε <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}
