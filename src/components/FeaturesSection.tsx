import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Brain, Volume2, History, Sparkles, Eye } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Camera,
      title: "Upload Your Cup",
      description: "Simply take a photo of your finished coffee cup and let our AI analyze the mystical patterns.",
      color: "text-rose-gold"
    },
    {
      icon: Brain,
      title: "AI Vision Analysis",
      description: "Advanced AI technology recognizes symbols, shapes, and patterns in your coffee grounds with mystical precision.",
      color: "text-mystical-purple"
    },
    {
      icon: Eye,
      title: "Choose Your Reader",
      description: "Select from three unique personas - each with their own wisdom, perspective, and reading style.",
      color: "text-golden"
    },
    {
      icon: Volume2,
      title: "Audio Predictions",
      description: "Listen to your personalized reading with voice that matches your chosen mystical reader's personality.",
      color: "text-mystical-purple-light"
    },
    {
      icon: History,
      title: "Reading History",
      description: "Keep track of all your readings, export to PDF, and watch your mystical journey unfold over time.",
      color: "text-rose-gold"
    },
    {
      icon: Sparkles,
      title: "Personalized Insights",
      description: "Get readings tailored to love, career, family, or fortune based on your current life situation.",
      color: "text-golden"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-soft relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-48 h-48 bg-mystical-purple/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-32 right-1/3 w-36 h-36 bg-golden/8 rounded-full blur-2xl animate-float delay-1000"></div>
        <div className="absolute top-1/2 right-20 w-24 h-24 bg-rose-gold/10 rounded-full blur-xl animate-mystical-glow"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-mystical font-bold text-mystical-purple mb-6">
            Ancient Wisdom Meets Modern AI
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the mystical art of coffee reading enhanced by cutting-edge artificial intelligence
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index}
                className="relative overflow-hidden border-2 border-mystical-purple/20 hover:border-mystical-purple/40 transition-all duration-300 hover:scale-105 hover:shadow-soft bg-card/70 backdrop-blur-sm animate-fade-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-mystical/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className={`h-8 w-8 ${feature.color} group-hover:animate-mystical-glow`} />
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg font-mystical text-mystical-purple mb-2">
                    {feature.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="text-center">
                  <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-golden rounded-full opacity-40 animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-1 h-1 bg-mystical-purple rounded-full opacity-60 animate-mystical-glow"></div>
              </Card>
            );
          })}
        </div>

        {/* Feature Flow Indicator */}
        <div className="flex justify-center mt-16">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-mystical-purple rounded-full animate-pulse"></div>
            <div className="w-12 h-0.5 bg-gradient-mystical"></div>
            <div className="w-3 h-3 bg-golden rounded-full animate-pulse delay-500"></div>
            <div className="w-12 h-0.5 bg-gradient-golden"></div>
            <div className="w-3 h-3 bg-rose-gold rounded-full animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;