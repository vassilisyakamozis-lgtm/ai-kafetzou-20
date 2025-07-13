import { Button } from "@/components/ui/button";
import { Sparkles, Star, Coffee, Eye } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-soft pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-mystical-purple/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-32 right-20 w-24 h-24 bg-golden/20 rounded-full blur-lg animate-float delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-rose-gold/15 rounded-full blur-md animate-mystical-glow"></div>
        
        {/* Floating Icons */}
        <div className="absolute top-32 right-1/4 text-mystical-purple/30 animate-float">
          <Star className="h-6 w-6" />
        </div>
        <div className="absolute bottom-40 left-1/3 text-golden/40 animate-float delay-500">
          <Sparkles className="h-8 w-8" />
        </div>
        <div className="absolute top-40 left-20 text-rose-gold/30 animate-float delay-1500">
          <Coffee className="h-5 w-5" />
        </div>
        <div className="absolute bottom-60 right-32 text-mystical-purple/25 animate-float delay-2000">
          <Eye className="h-7 w-7" />
        </div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* AI Robot Coffee Visual Placeholder */}
          <div className="mb-12 relative">
            <div className="w-64 h-64 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-mystical rounded-full opacity-20 animate-mystical-glow"></div>
              <div className="absolute inset-4 bg-gradient-golden rounded-full opacity-30 animate-float"></div>
              <div className="absolute inset-8 bg-background rounded-full border-2 border-mystical-purple/20 flex items-center justify-center">
                <div className="text-center">
                  <Coffee className="h-16 w-16 text-mystical-purple mx-auto mb-2 animate-mystical-glow" />
                  <Sparkles className="h-8 w-8 text-golden mx-auto animate-float" />
                </div>
              </div>
            </div>
          </div>

          {/* Hero Text */}
          <div className="space-y-6 mb-12">
            <h1 className="text-5xl md:text-7xl font-mystical font-bold text-mystical-purple leading-tight">
              Discover Your
              <span className="block bg-gradient-golden bg-clip-text text-transparent">
                Mystical Destiny
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Ancient coffee reading meets modern AI. Upload your cup, choose your mystical reader, 
              and unveil the secrets hidden in your coffee grounds.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button size="lg" variant="mystical" className="w-full sm:w-auto">
              <Sparkles className="mr-2 h-5 w-5" />
              Start Free Reading
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <Eye className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-golden fill-current" />
              <span>7-Day Free Trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-mystical-purple" />
              <span>3 Mystical Readers</span>
            </div>
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-rose-gold" />
              <span>Ancient Wisdom, Modern AI</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;