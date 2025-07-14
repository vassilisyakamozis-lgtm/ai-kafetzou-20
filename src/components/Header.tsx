import { Button } from "@/components/ui/button";
import { Crown, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-mystical-purple/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Crown className="h-8 w-8 text-mystical-purple animate-mystical-glow" />
              <Sparkles className="h-4 w-4 text-golden absolute -top-1 -right-1 animate-float" />
            </div>
            <div>
              <h1 className="text-xl font-mystical font-bold text-mystical-purple">
                AI Kafetzou
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">Mystical Oracle</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-foreground hover:text-mystical-purple transition-colors">
              Χαρακτηριστικά
            </a>
            <a href="#readers" className="text-foreground hover:text-mystical-purple transition-colors">
              Καφετζούδες
            </a>
            <Link to="/cup" className="text-foreground hover:text-mystical-purple transition-colors">
              Φλιτζάνι
            </Link>
            <a href="#pricing" className="text-foreground hover:text-mystical-purple transition-colors">
              Τιμές
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              Σύνδεση
            </Button>
            <Button variant="mystical" size="sm">
              Εγγραφή
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;