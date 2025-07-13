import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Heart, Sparkles } from "lucide-react";

const ReadersSection = () => {
  const readers = [
    {
      id: 1,
      name: "Νεαρή Μάντισσα",
      title: "Young Oracle",
      age: "25 years",
      specialty: "Love & New Beginnings",
      description: "Fresh insights with youthful optimism. Perfect for new relationships, career changes, and creative endeavors.",
      icon: Heart,
      gradient: "from-rose-gold to-soft-pink",
      shadow: "shadow-rose-gold-light"
    },
    {
      id: 2,
      name: "Έμπειρη Καφετζού",
      title: "Experienced Reader",
      age: "45 years", 
      specialty: "Life Balance & Wisdom",
      description: "Balanced perspective with life experience. Ideal for family matters, professional guidance, and personal growth.",
      icon: Crown,
      gradient: "from-mystical-purple to-mystical-purple-light",
      shadow: "shadow-mystical"
    },
    {
      id: 3,
      name: "Σοφή Γιαγιά",
      title: "Wise Grandmother",
      age: "70 years",
      specialty: "Deep Wisdom & Fate",
      description: "Ancient wisdom and profound insights. Best for major life decisions, spiritual guidance, and understanding destiny.",
      icon: Sparkles,
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
            Choose Your Mystical Reader
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Each reader brings their unique perspective and wisdom to interpret the sacred symbols in your coffee cup.
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
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${reader.gradient} flex items-center justify-center animate-mystical-glow`}>
                      <IconComponent className="h-10 w-10 text-white" />
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
                      Specialty: {reader.specialty}
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
                    Choose {reader.name.split(' ')[0]}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-6">
            Don't worry - you can always change readers between readings
          </p>
          <Button variant="mystical" size="lg">
            <Sparkles className="mr-2 h-5 w-5" />
            Start Your First Reading
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ReadersSection;