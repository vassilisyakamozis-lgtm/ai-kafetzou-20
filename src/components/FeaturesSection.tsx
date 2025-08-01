import { Card, CardContent } from "@/components/ui/card";
import { Wand2, Camera, BookOpen, Stars, Heart, Lightbulb } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Wand2,
      title: "AI Καφεμαντεία",
      description: "Προηγμένη τεχνητή νοημοσύνη αναλύει το φλιτζάνι σου και αποκαλύπτει μυστικά του μέλλοντος",
      color: "accent-purple"
    },
    {
      icon: Camera,
      title: "Φωτογραφία Φλιτζανιού",
      description: "Απλά βγάλε μια φωτογραφία του φλιτζανιού σου και άσε το AI να κάνει τη μαγεία",
      color: "accent-blue"
    },
    {
      icon: BookOpen,
      title: "Προσωποποιημένη Ερμηνεία",
      description: "Κάθε ανάγνωση είναι μοναδική, προσαρμοσμένη στα σχήματα του δικού σου φλιτζανιού",
      color: "navy"
    },
    {
      icon: Stars,
      title: "Αρχαία Σοφία",
      description: "Συνδυάζουμε παραδοσιακές τεχνικές καφεμαντείας με σύγχρονη τεχνολογία",
      color: "accent-purple"
    },
    {
      icon: Heart,
      title: "Αγάπη & Σχέσεις",
      description: "Ειδικές προβλέψεις για την ερωτική ζωή και τις προσωπικές σχέσεις",
      color: "accent-blue"
    },
    {
      icon: Lightbulb,
      title: "Καθοδήγηση Ζωής",
      description: "Λάβε συμβουλές και καθοδήγηση για σημαντικές αποφάσεις στη ζωή σου",
      color: "navy"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-custom-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            Πώς Λειτουργεί η{" "}
            <span className="text-accent-purple">
              Μαγεία
            </span>
          </h2>
          <p className="text-xl text-gray-custom-medium max-w-2xl mx-auto">
            Ανακάλυψε πώς η τεχνητή νοημοσύνη συναντά την αρχαία τέχνη της καφεμαντείας
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-card hover:shadow-lg transition-all duration-300 border-gray-custom-border bg-white">
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gray-custom-light flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-8 w-8 text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-custom-medium leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Flow */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center space-x-6 bg-white rounded-full p-6 border border-gray-custom-border shadow-card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-accent-purple/10 flex items-center justify-center">
                <span className="text-sm font-bold text-accent-purple">1</span>
              </div>
              <span className="text-sm font-medium text-foreground">Φωτογραφία</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-custom-border"></div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center">
                <span className="text-sm font-bold text-accent-blue">2</span>
              </div>
              <span className="text-sm font-medium text-foreground">Ανάλυση AI</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-custom-border"></div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center">
                <span className="text-sm font-bold text-navy">3</span>
              </div>
              <span className="text-sm font-medium text-foreground">Ερμηνεία</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;