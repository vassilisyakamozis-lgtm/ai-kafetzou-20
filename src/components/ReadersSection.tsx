import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Heart, Sparkles } from "lucide-react";
import renaImage from "@/assets/rena-modern.jpg";
import katinaImage from "@/assets/katina-smyrnia.jpg";
import isisdoraImage from "@/assets/isisdora-spiritual.jpg";

const ReadersSection = () => {
  const readers = [
    {
      id: 1,
      name: "Ρένα η μοντέρνα",
      title: "Modern Oracle",
      age: "25 years",
      specialty: "Αγάπη & Νέες Αρχές",
      description: "Φρέσκιες προβλέψεις με νεανική αισιοδοξία. Ιδανική για νέες σχέσεις, αλλαγές καριέρας και δημιουργικές προσπάθειες.",
      icon: Heart,
      image: renaImage,
      gradient: "from-rose-gold to-soft-pink",
      shadow: "shadow-rose-gold-light"
    },
    {
      id: 2,
      name: "Κατίνα η Σμυρνιά",
      title: "Traditional Reader",
      age: "45 years", 
      specialty: "Ισορροπία Ζωής & Σοφία",
      description: "Ισορροπημένη οπτική με εμπειρία ζωής. Ιδανική για οικογενειακά θέματα, επαγγελματική καθοδήγηση και προσωπική ανάπτυξη.",
      icon: Crown,
      image: katinaImage,
      gradient: "from-mystical-purple to-mystical-purple-light",
      shadow: "shadow-mystical"
    },
    {
      id: 3,
      name: "Ισισδώρα η πνευματική",
      title: "Spiritual Grandmother",
      age: "70 years",
      specialty: "Βαθιά Σοφία & Μοίρα",
      description: "Αρχαία σοφία και βαθιές προβλέψεις. Καλύτερη για σημαντικές αποφάσεις ζωής, πνευματική καθοδήγηση και κατανόηση του πεπρωμένου.",
      icon: Sparkles,
      image: isisdoraImage,
      gradient: "from-golden to-golden-light",
      shadow: "shadow-golden"
    }
  ];

  return (
    <section id="readers" className="py-20 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-20 w-40 h-40 bg-mystical-purple/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-golden/10 rounded-full blur-xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-mystical font-bold text-mystical-purple mb-6">
            Διάλεξε την Μυστική σου Καφετζού
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Κάθε καφετζού φέρνει την μοναδική της οπτική και σοφία για να ερμηνεύσει τα ιερά σύμβολα στο φλιτζάνι σου.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {readers.map((reader, index) => {
            const IconComponent = reader.icon;
            return (
              <Card 
                key={reader.id} 
                className={`relative overflow-hidden border-2 border-mystical-purple/20 hover:border-mystical-purple/40 transition-all duration-300 hover:scale-105 hover:${reader.shadow} bg-card/50 backdrop-blur-sm animate-fade-in`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Card Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${reader.gradient} opacity-5`}></div>
                
                <CardHeader className="text-center relative z-10">
                  <div className="mx-auto mb-4 relative">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-mystical-purple/30 animate-mystical-glow">
                      <img 
                        src={reader.image} 
                        alt={reader.name}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${reader.gradient} opacity-20`}></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-white drop-shadow-lg" />
                      </div>
                    </div>
                    {/* Age Badge */}
                    <div className="absolute -bottom-2 -right-2 bg-background border-2 border-mystical-purple/30 rounded-full px-2 py-1 text-xs font-medium text-mystical-purple">
                      {reader.age}
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl font-mystical text-mystical-purple mb-2">
                    {reader.name}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-golden">
                    {reader.title}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center space-y-4 relative z-10">
                  <div className="bg-mystical-purple/10 rounded-xl p-3 mb-4">
                    <p className="text-sm font-medium text-mystical-purple">
                      Ειδικότητα: {reader.specialty}
                    </p>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {reader.description}
                  </p>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-6 hover:bg-mystical-purple/10 hover:border-mystical-purple/50"
                  >
                    Διάλεξε {reader.name.split(' ')[0]}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-6">
            Μην ανησυχείς - μπορείς πάντα να αλλάξεις καφετζού ανάμεσα στις αναγνώσεις
          </p>
          <Button variant="mystical" size="lg">
            <Sparkles className="mr-2 h-5 w-5" />
            Ξεκίνα την Πρώτη σου Ανάγνωση
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ReadersSection;