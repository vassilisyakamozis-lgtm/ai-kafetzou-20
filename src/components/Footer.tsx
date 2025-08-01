import { Coffee, Heart, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-navy text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Coffee className="h-5 w-5 text-navy" />
              </div>
              <span className="text-2xl font-serif font-bold">AI Kafetzou</span>
            </div>
            <p className="text-white/80 mb-6 max-w-md leading-relaxed">
              Η πρώτη πλατφόρμα που συνδυάζει την αρχαία τέχνη της καφεμαντείας με την τεχνητή νοημοσύνη. 
              Ανακαλύψτε τα μυστικά του μέλλοντός σας μέσα από το φλιτζάνι σας.
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                <Mail className="h-4 w-4 mr-2" />
                Επικοινωνία
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-serif font-semibold mb-4">Γρήγοροι Σύνδεσμοι</h3>
            <ul className="space-y-3">
              <li><a href="#features" className="text-white/80 hover:text-white transition-colors">Χαρακτηριστικά</a></li>
              <li><a href="#readers" className="text-white/80 hover:text-white transition-colors">Αναγνώστριες</a></li>
              <li><a href="#pricing" className="text-white/80 hover:text-white transition-colors">Τιμές</a></li>
              <li><a href="/cup" className="text-white/80 hover:text-white transition-colors">Ανάγνωση</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-serif font-semibold mb-4">Επικοινωνία</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-white/80">
                <Mail className="h-4 w-4 mr-2" />
                info@aikafetzou.gr
              </li>
              <li className="flex items-center text-white/80">
                <Phone className="h-4 w-4 mr-2" />
                +30 210 1234567
              </li>
              <li className="flex items-center text-white/80">
                <MapPin className="h-4 w-4 mr-2" />
                Αθήνα, Ελλάδα
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20 bg-navy-light">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-white/60 mb-4 md:mb-0">
              © 2024 AI Kafetzou. Όλα τα δικαιώματα διατηρούνται.
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                Πολιτική Απορρήτου
              </a>
              <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                Όροι Χρήσης
              </a>
              <div className="flex items-center text-sm text-white/60">
                Made with <Heart className="h-4 w-4 mx-1 text-accent-blue" /> in Greece
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;