// src/pages/Home.tsx
import { Link } from "react-router-dom";
import {
  Coffee,
  Camera,
  Upload,
  Gem,
  Heart,
  Users,
  Briefcase,
  Sparkles,
  Quote,
  ArrowRight,
  Feather,
  Newspaper,
} from "lucide-react";

function SectionTitle({
  overline,
  title,
  subtitle,
}: {
  overline?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-10">
      {overline ? (
        <div className="text-xs uppercase tracking-widest text-rose-500 font-semibold mb-2">
          {overline}
        </div>
      ) : null}
      <h2 className="text-3xl md:text-4xl font-serif text-slate-800">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-slate-600 mt-3 leading-relaxed">{subtitle}</p>
      ) : null}
    </div>
  );
}

function StepCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border bg-white/70 backdrop-blur-sm p-6 shadow-sm hover:shadow-md transition">
      <div className="h-11 w-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <p className="text-slate-600 mt-2 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function Pill({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border bg-white/70 backdrop-blur-sm p-6 shadow-sm hover:shadow-md transition">
      <div className="h-10 w-10 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center mb-3">
        {icon}
      </div>
      <div className="font-medium text-slate-800">{title}</div>
      <div className="text-slate-600 text-sm mt-1">{text}</div>
    </div>
  );
}

function BlogCard({
  image,
  category,
  title,
  excerpt,
}: {
  image: string;
  category: string;
  title: string;
  excerpt: string;
}) {
  return (
    <article className="rounded-2xl overflow-hidden border bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition flex flex-col">
      <img src={image} alt={title} className="h-44 w-full object-cover" />
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="text-xs uppercase tracking-wider text-slate-500">
          {category}
        </div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed flex-1">{excerpt}</p>
        <div className="pt-2">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1 text-violet-700 hover:text-violet-900 font-medium text-sm"
          >
            Διάβασε περισσότερα <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <main className="bg-gradient-to-b from-violet-50 via-white to-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.12),transparent_55%)]" />
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 text-violet-700/90 font-semibold">
              <Coffee className="h-5 w-5" />
              AI Kafetzou
            </div>
            <h1 className="mt-3 text-4xl md:text-5xl font-serif text-slate-900 leading-tight">
              Ξεκλείδωσε την Αρχαία Τέχνη της Καφεμαντείας
            </h1>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Το πεπρωμένο σου σε περιμένει στο φλιτζάνι σου. Με τη βοήθεια της
              Τεχνητής Νοημοσύνης, οι συμβολισμοί αποκτούν φωνή –
              εξατομικευμένα, ζεστά και ουσιαστικά.
            </p>

            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                to="/cup"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-700 text-white px-6 py-3 shadow-sm hover:bg-violet-800 transition"
              >
                Ξεκίνα Ανάγνωση Τώρα <Sparkles className="h-5 w-5" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 rounded-xl border bg-white/80 px-6 py-3 text-slate-700 hover:bg-white transition"
              >
                Δες Πακέτα <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ΒΗΜΑΤΑ */}
      <section className="container mx-auto px-4 py-14">
        <SectionTitle
          title="Ανακάλυψε το Πεπρωμένο Σου"
          subtitle="Τρία απλά βήματα για να αποκαλύψεις τα μυστικά που κρύβονται στο φλιτζάνι."
        />
        <div className="grid md:grid-cols-3 gap-6">
          <StepCard
            icon={<Camera className="h-5 w-5" />}
            title="1. Φωτογράφισε το Φλιτζάνι"
            text="Τράβηξε καθαρή φωτογραφία από το κατακάθι του καφέ στο φλιτζάνι σου."
          />
          <StepCard
            icon={<Upload className="h-5 w-5" />}
            title="2. Ανέβασέ το με Ευκολία"
            text="Ανέβασε τη φωτογραφία στην πλατφόρμα. Η AI αναλύει τα σύμβολα και τα μοτίβα."
          />
          <StepCard
            icon={<Gem className="h-5 w-5" />}
            title="3. Λάβε τον Χρησμό Σου"
            text="Πάρε μια ζεστή, κατανοητή ερμηνεία και πρακτικές συμβουλές για το μέλλον."
          />
        </div>
      </section>

      {/* ΘΕΜΑΤΙΚΕΣ */}
      <section className="container mx-auto px-4 py-14">
        <SectionTitle
          title="Ξεκλείδωσε την Αρχαία Σοφία"
          subtitle="Εμβάθυνε στις παραδοσιακές ερμηνείες με σύγχρονη ματιά, σε όλους τους τομείς της ζωής σου."
        />
        <div className="grid md:grid-cols-4 gap-6">
          <Pill
            icon={<Heart className="h-5 w-5" />}
            title="Έρωτας & Σχέσεις"
            text="Τι δείχνουν τα μοτίβα για την καρδιά σου."
          />
          <Pill
            icon={<Users className="h-5 w-5" />}
            title="Οικογενειακά Θέματα"
            text="Ισορροπία, κατανόηση και δεσμοί."
          />
          <Pill
            icon={<Briefcase className="h-5 w-5" />}
            title="Επαγγελματικά"
            text="Ευκαιρίες, εμπόδια & προοπτικές."
          />
          <Pill
            icon={<Feather className="h-5 w-5" />}
            title="Τύχη"
            text="Ευνοϊκές συγκυρίες και σημάδια."
          />
        </div>
      </section>

      {/* QUOTE / ΜΑΡΤΥΡΙΑ */}
      <section className="relative">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto rounded-2xl border bg-white/80 backdrop-blur-sm p-8 shadow-sm">
            <div className="text-rose-500 mb-3">
              <Quote className="h-6 w-6" />
            </div>
            <p className="text-slate-700 leading-relaxed">
              “Ένα ελικοειδές μονοπάτι εμφανίζεται, οδηγώντας σε μια
              απροσδόκητη πόρτα. Αλλαγές στην καριέρα διαφαίνονται, φαινομενικά
              προκλητικές αλλά γεμάτες ευκαιρίες. Στα αισθηματικά, ένα σημάδι
              δείχνει ότι η διαίσθηση θα σε οδηγήσει σε καθαρότερες σχέσεις.”
            </p>
            <div className="text-right mt-3 text-sm text-slate-500">
              – Ένας Χρήστης του AI Kafetzou
            </div>
          </div>
        </div>
      </section>

      {/* CTA μονοπάτι */}
      <section className="container mx-auto px-4 py-14">
        <SectionTitle
          title="Επίλεξε το Μονοπάτι σου προς τη Διαύγεια"
          subtitle="Ξεκίνα με μια δωρεάν ανάγνωση ή αναβάθμισε σε premium πακέτα για βαθύτερη σοφία."
        />
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/cup"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-700 text-white px-6 py-3 shadow-sm hover:bg-violet-800 transition"
          >
            Δωρεάν Ανάγνωση
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 rounded-xl border bg-white/80 px-6 py-3 text-slate-700 hover:bg-white transition"
          >
            Δες τα Πακέτα
          </Link>
        </div>
      </section>

      {/* BLOG PREVIEW */}
      <section className="container mx-auto px-4 py-14">
        <SectionTitle
          overline="Από το Blog της Μάντισσας"
          title="Άρθρα για Καφεμαντεία & Μυστικιστικές Τέχνες"
        />
        <div className="grid md:grid-cols-3 gap-6">
          <BlogCard
            image="https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1200&auto=format&fit=crop"
            category="Ιστορία & Παράδοση"
            title="Από το κατακάθι στο μέλλον: το ταξίδι της καφεμαντείας"
            excerpt="Μια σύντομη περιήγηση στις ρίζες και τους συμβολισμούς του καφέ."
          />
          <BlogCard
            image="https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=1200&auto=format&fit=crop"
            category="Συμβολισμοί"
            title="Κοινά σύμβολα που κρύβονται στο φλιτζάνι"
            excerpt="Κλειδιά ερμηνείας για μοτίβα που οι περισσότεροι αγνοούν."
          />
          <BlogCard
            image="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop"
            category="AI & Μυστικισμός"
            title="Πώς η AI ενισχύει την παραδοσιακή ερμηνεία"
            excerpt="Τεχνολογία και διαίσθηση συνεργάζονται για καθαρότερα μηνύματα."
          />
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-violet-700 hover:text-violet-900 font-medium"
          >
            <Newspaper className="h-5 w-5" />
            Δες περισσότερα άρθρα
          </Link>
        </div>
      </section>
    </main>
  );
}
