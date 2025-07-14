import { useState, useEffect } from "react";
import { Coffee, Sparkles, Eye, Star } from "lucide-react";

interface CupReadingLoaderProps {
  readerName: string;
}

const CupReadingLoader = ({ readerName }: CupReadingLoaderProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState('');

  const steps = [
    {
      icon: Coffee,
      text: "Εξετάζω το φλιτζάνι σας...",
      duration: 3000
    },
    {
      icon: Eye,
      text: "Αναγνωρίζω τα σχήματα του κατακάθι...",
      duration: 4000
    },
    {
      icon: Sparkles,
      text: "Ερμηνεύω τα μυστικά σημάδια...",
      duration: 3500
    },
    {
      icon: Star,
      text: "Προετοιμάζω τον χρησμό σας...",
      duration: 2500
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, steps[currentStep].duration);

      return () => clearTimeout(timer);
    }
  }, [currentStep, steps]);

  const CurrentIcon = steps[currentStep]?.icon || Coffee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-mystical-purple/20 via-background to-rose-gold/20 flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        {/* Mystical crystal ball animation */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto relative">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-mystical-purple via-rose-gold to-golden opacity-30 animate-spin-slow"></div>
            
            {/* Middle ring */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-golden via-mystical-purple-light to-rose-gold opacity-50 animate-spin-reverse"></div>
            
            {/* Crystal ball */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/80 via-mystical-purple/20 to-rose-gold/30 border-2 border-mystical-purple/30 shadow-mystical flex items-center justify-center">
              <CurrentIcon className="h-8 w-8 text-mystical-purple animate-pulse" />
            </div>
            
            {/* Floating sparkles */}
            <div className="absolute -top-2 -left-2">
              <Sparkles className="h-4 w-4 text-golden animate-bounce" style={{ animationDelay: '0s' }} />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-3 w-3 text-rose-gold animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
            <div className="absolute -bottom-2 -left-2">
              <Sparkles className="h-3 w-3 text-mystical-purple-light animate-bounce" style={{ animationDelay: '1s' }} />
            </div>
            <div className="absolute -bottom-2 -right-2">
              <Sparkles className="h-4 w-4 text-golden animate-bounce" style={{ animationDelay: '1.5s' }} />
            </div>
          </div>
        </div>

        {/* Reader name */}
        <h2 className="text-2xl font-mystical font-bold text-mystical-purple mb-4">
          {readerName}
        </h2>

        {/* Current step */}
        <div className="mb-6">
          <p className="text-lg text-mystical-purple-dark font-medium">
            {steps[currentStep]?.text}{dots}
          </p>
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center space-x-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                index <= currentStep 
                  ? 'bg-mystical-purple scale-125' 
                  : 'bg-mystical-purple/30'
              }`}
            />
          ))}
        </div>

        {/* Mystical message */}
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-mystical-purple/20">
          <p className="text-sm text-mystical-purple-dark italic">
            "Τα φύλλα του καφέ ψιθυρίζουν μυστικά από το παρελθόν και το μέλλον..."
          </p>
        </div>

        {/* Animated coffee steam */}
        <div className="mt-6 flex justify-center">
          <div className="relative">
            <Coffee className="h-6 w-6 text-mystical-purple" />
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
              <div className="w-1 h-4 bg-gradient-to-t from-mystical-purple/50 to-transparent rounded-full animate-pulse"></div>
            </div>
            <div className="absolute -top-2 left-1/3 transform -translate-x-1/2">
              <div className="w-1 h-3 bg-gradient-to-t from-mystical-purple/30 to-transparent rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
            <div className="absolute -top-2 right-1/3 transform translate-x-1/2">
              <div className="w-1 h-3 bg-gradient-to-t from-mystical-purple/30 to-transparent rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CupReadingLoader;