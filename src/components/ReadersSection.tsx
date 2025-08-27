import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Heart, Sparkles } from "lucide-react";

const ReadersSection = () => {
  const readers = [
    {
      id: 1,
      name: "Ρένα η μοντέρνα",
      title: "Modern Oracle",
      age: "25 years",
      specialty: "Αγάπη & Νέες Αρχές",
      description:
        "Φρέσκες προβλέψεις με νεανική αισιοδοξία. Ιδανική για νέες σχέσεις, αλλαγές καριέρας και δημιουργικές προσπάθειες.",
      icon: Heart,
      image:
        "https://ziqhqdorqfowubjrchyu.supabase.co/storage/v1/object/public/tellers/modern%20woman.png?v=2",
    },
    {
      id: 2,
      name: "Μαίρη η ψαγμένη",
      title: "Traditional Reader",
      age: "45 years",
      specialty: "Ισορροπία Ζωής & Σοφία",
      description:
        "Ισορροπημένη οπτική με εμπειρία ζωής. Ιδανική για οικογενειακά θέματα, επαγγελματική καθοδήγηση και προσωπική ανάπτυξη.",
      icon: Crown,
      image:
        "https://ziqhqdorqfowubjrchyu.supabase.co/storage/v1/object/public/tellers/katina-klassiki.png?v=2",
    },
    {
      id: 3,
      name: "Ισιδώρα η πνευματική",
      title: "Spiritual Grandmother",
      age: "70 years",
      specialty: "Βαθιά Σοφία & Μοίρα",
      description:
        "Αρχαία σοφία και βαθιές προβλέψεις. Για σημαντικές αποφάσεις ζωής, πνευματική καθοδήγηση και κατανόηση του πεπρωμένου.",
      icon: Sparkles,
      image:
        "https://ziqhqdorqfowubjrchyu.supabase.co/storage/v1/object/public/tellers/mystic%20woman.png?v=2",
    },
  ];

  return (
    <section id="readers" className="py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-mystical font-bold text-mystical-purple mb-6">
            Διάλεξε την Μυστική σου Καφετζού
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Κάθε καφετζού φέρνει τη μοναδική της οπτική και σοφία.
          </p>
        </div>

        {/* Responsive grid: 1 → 2 (sm) → 3 (md) στήλες */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {readers.map((reader, index) => {
            const IconComponent = reader.icon;
            return (
              <Card
                key={reader.id}
                className="relative overflow-hidden rounded-2xl bg-white flex flex-col
                           shadow-[0_8px_24px_rgba(139,92,246,0.12)]
                           hover:shadow-[0_12px_32px_rgba(139,92,246,0.18)]
                           transition-all duration-300 hover:-translate-y-0.5"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Full-bleed τετράγωνη εικόνα */}
                <div className="w-full aspect-square overflow-hidden">
                  <img
                    src={reader.image}
                    alt={reader.name}
                    className="h-full w-full object-cover will-change-transform"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <CardHeader className="text-center pb-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-golden">
                    <IconComponent className="h-4 w-4" />
                    <span className="font-medium">{reader.specialty}</span>
                  </div>
                  <CardTitle className="font-mystical font-semibold text-[22px] text-mystical-purple mt-2">
                    {reader.name}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-golden">
                    {reader.title}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center flex-1 flex flex-col justify-between px-6 pb-6">
                  <p className="font-elegant text-base text-[#3B1F4A] leading-relaxed mb-6">
                    {reader.description}
                  </p>
                  <Button className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-xl px-5 py-2">
                    Διάλεξε {reader.name.split(" ")[0]}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ReadersSection;
