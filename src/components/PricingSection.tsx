import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Star, Sparkles } from "lucide-react";

const PricingSection = () => {
  const plans = [
    {
      name: "Daily Oracle",
      price: "€9.99",
      period: "/month",
      description: "Perfect for daily mystical guidance",
      icon: Star,
      gradient: "from-rose-gold to-soft-pink",
      popular: false,
      features: [
        "Daily coffee readings",
        "Choose any reader",
        "Audio predictions",
        "Reading history",
        "Basic categories"
      ]
    },
    {
      name: "The Third Eye Opens", 
      price: "€19.99",
      period: "/month",
      description: "For those seeking deeper wisdom",
      icon: Crown,
      gradient: "from-mystical-purple to-mystical-purple-light",
      popular: true,
      features: [
        "Unlimited readings",
        "All 3 mystical readers",
        "Personalized questions",
        "Premium audio voices",
        "PDF exports",
        "All categories",
        "Priority support"
      ]
    },
    {
      name: "Free Trial",
      price: "€0",
      period: "/7 days",
      description: "Discover your mystical journey",
      icon: Sparkles,
      gradient: "from-golden to-golden-light",
      popular: false,
      features: [
        "7 free readings",
        "Try all readers",
        "Basic audio",
        "Limited history",
        "1 personalized question"
      ]
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-20 w-40 h-40 bg-mystical-purple/5 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-golden/8 rounded-full blur-xl animate-float delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-mystical font-bold text-mystical-purple mb-6">
            Choose Your Mystical Path
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start your journey with our free trial, then select the plan that resonates with your soul
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <Card 
                key={index}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 bg-card/70 backdrop-blur-sm ${
                  plan.popular 
                    ? 'border-2 border-mystical-purple shadow-mystical scale-105' 
                    : 'border-2 border-mystical-purple/20 hover:border-mystical-purple/40 hover:shadow-soft'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-gradient-mystical text-white px-4 py-1 rounded-full text-xs font-bold shadow-mystical">
                      MOST POPULAR
                    </div>
                  </div>
                )}

                {/* Card Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-5`}></div>
                
                <CardHeader className="text-center relative z-10 pt-8">
                  <div className="mx-auto mb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center animate-mystical-glow`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-mystical text-mystical-purple mb-2">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-mystical-purple">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-mystical-purple mr-3 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    variant={plan.popular ? "mystical" : "outline"} 
                    size="lg" 
                    className="w-full"
                  >
                    {plan.price === "€0" ? "Start Free Trial" : "Choose Plan"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-4">
            All plans include secure payment processing and can be cancelled anytime
          </p>
          <p className="text-xs text-muted-foreground">
            ✨ No hidden fees • 💫 Instant access • 🔮 Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;