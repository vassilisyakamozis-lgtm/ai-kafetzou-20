import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import renaImage from "@/assets/rena-modern.jpg";
import katinaImage from "@/assets/katina-smyrnia.jpg";
import isisdoraImage from "@/assets/isisdora-spiritual.jpg";

const ReadersSection = () => {
  const readers = [
    {
      name: "Ισιδώρα",
      title: "Πνευματικός Οδηγός",
      age: "Εμπειρία 15+ ετών",
      specialty: "Πνευματική Ανάπτυξη & Καθοδήγηση",
      description: "Η Ισιδώρα συνδυάζει την αρχαία σοφία με σύγχρονες τεχνικές διαβάσματος. Ειδικεύεται στην πνευματική ανάπτυξη και τη βαθιά κατανόηση του εσωτερικού σας κόσμου.",
      icon: Sparkles,
      image: isisdoraImage,
      color: "accent-purple"
    },
    {
      name: "Κατίνα",
      title: "Παραδοσιακή Καφεμάντισσα",
      age: "Εμπειρία 25+ ετών",
      specialty: "Κλασική Καφεμαντεία & Οικογενειακές Σχέσεις",
      description: "Η Κατίνα κατέχει την παραδοσιακή τέχνη της καφεμαντείας που μεταδίδεται από γενιά σε γενιά. Ειδικεύεται σε θέματα οικογένειας, αγάπης και προσωπικών σχέσεων.",
      icon: Heart,
      image: katinaImage,
      color: "accent-blue"
    },
    {
      name: "Ρένα",
      title: "Σύγχρονη Μυστικίστρια",
      age: "Εμπειρία 10+ ετών",
      specialty: "Καριέρα & Επαγγελματική Ανάπτυξη",
      description: "Η Ρένα φέρνει μια σύγχρονη προσέγγιση στην καφεμαντεία, εστιάζοντας σε θέματα καριέρας, επιχειρηματικότητας και επαγγελματικής ανάπτυξης.",
      icon: Crown,
      image: renaImage,
      color: "navy"
    }
  ];

  return (
    <section id="readers" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            Επιλέξτε την{" "}
            <span className="text-accent-purple">
              Αναγνώστριά
            </span>{" "}
            σας
          </h2>
          <p className="text-xl text-gray-custom-medium max-w-2xl mx-auto">
            Κάθε αναγνώστρια φέρνει τη δική της μοναδική προσέγγιση και εξειδίκευση
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {readers.map((reader, index) => (
            <Card key={index} className="group hover:shadow-card hover:shadow-lg transition-all duration-300 border-gray-custom-border bg-white overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={reader.image} 
                    alt={reader.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className={`absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg`}>
                    <reader.icon className={`h-5 w-5 text-${reader.color}`} />
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-serif font-bold text-foreground mb-1">
                      {reader.name}
                    </h3>
                    <p className="text-sm text-gray-custom-medium mb-1">{reader.title}</p>
                    <p className="text-xs text-gray-custom-medium">{reader.age}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm text-foreground mb-2">Εξειδίκευση:</h4>
                    <p className="text-sm text-gray-custom-medium">{reader.specialty}</p>
                  </div>
                  
                  <p className="text-sm text-gray-custom-medium leading-relaxed mb-6">
                    {reader.description}
                  </p>
                  
                  <Button 
                    className="w-full bg-navy hover:bg-navy-light text-white font-medium shadow-button"
                    asChild
                  >
                    <Link to="/cup">Επιλογή {reader.name}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gray-custom-light rounded-2xl p-8 border border-gray-custom-border">
          <h3 className="text-2xl font-serif font-bold text-foreground mb-4">
            Έτοιμοι να Ανακαλύψετε το Μέλλον σας;
          </h3>
          <p className="text-gray-custom-medium mb-6 max-w-md mx-auto">
            Ξεκινήστε τη μυστική σας ανάγνωση τώρα και αφήστε το AI να αποκαλύψει τα μυστικά του φλιτζανιού σας
          </p>
          <Button 
            size="lg"
            className="bg-accent-purple hover:bg-accent-purple/90 text-white font-medium px-8 shadow-button"
            asChild
          >
            <Link to="/cup">Ξεκινήστε Ανάγνωση Τώρα</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ReadersSection;