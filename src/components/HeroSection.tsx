import React from "react";
import { Button } from "@/components/ui/button";
import { Coffee, Star, Sparkles, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import galaxyBackground from "@/assets/galaxy-background.jpg";
import coffeeCupMystic from "@/assets/coffee-cup-mystic.png";

const HeroSection = () => {
  return (
    <section 
      className="min-h-screen relative flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${galaxyBackground})` }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-navy/60"></div>
      
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle floating elements */}
        <div className="absolute top-32 right-1/4 text-white/20 animate-float">
          <Star className="h-4 w-4" />
        </div>
        <div className="absolute bottom-40 left-1/3 text-white/15 animate-float delay-500">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="absolute top-40 left-20 text-white/10 animate-float delay-1500">
          <Coffee className="h-4 w-4" />
        </div>
        <div className="absolute bottom-60 right-32 text-white/15 animate-float delay-2000">
          <Eye className="h-5 w-5" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Central Coffee Cup Image */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <img 
                src={coffeeCupMystic} 
                alt="Mystic Coffee Cup" 
                className="w-32 h-32 md:w-40 md:h-40 object-contain animate-float"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/20 to-accent-blue/20 rounded-full blur-xl animate-pulse"></div>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight">
            Ανακάλυψε τη Μυστική σου{" "}
            <span className="bg-gradient-to-r from-accent-purple to-accent-blue bg-clip-text text-transparent">
              Μοίρα
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Η αρχαία τέχνη της καφεμαντείας συναντά την τεχνητή νοημοσύνη. 
            Ανακάλυψε τι κρύβει το φλιτζάνι σου με τη δύναμη του AI.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              asChild 
              className="bg-white text-navy hover:bg-white/90 shadow-button px-8 py-3 text-lg font-medium"
            >
              <Link to="/cup">Ξεκίνα την πρώτη Ανάγνωση</Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              asChild 
              className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg font-medium"
            >
              <Link to="#features">Δες πώς λειτουργεί</Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">Δωρεάν</div>
              <div className="text-sm text-white/60">Πρώτη Ανάγνωση</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">10,000+</div>
              <div className="text-sm text-white/60">Επιτυχημένες Αναγνώσεις</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">AI + Παράδοση</div>
              <div className="text-sm text-white/60">Αρχαία Σοφία</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;