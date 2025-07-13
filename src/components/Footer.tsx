import { Crown, Heart, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-mystical-purple text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-20 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-golden/20 rounded-full blur-lg"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <Crown className="h-8 w-8 text-golden" />
              <div>
                <h3 className="text-2xl font-mystical font-bold">AI Kafetzou</h3>
                <p className="text-white/80 text-sm">Mystical Oracle</p>
              </div>
            </div>
            <p className="text-white/70 leading-relaxed max-w-md">
              Ανακάλυψε τη μοίρα σου μέσα από την αρχαία τέχνη της καφετζούς, ενισχυμένη από σύγχρονη τεχνολογία AI. 
              Άσε τις μυστικές μας καφετζούδες να σε καθοδηγήσουν στο πνευματικό σου ταξίδι.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-golden">Γρήγοροι Σύνδεσμοι</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-white/70 hover:text-white transition-colors">Χαρακτηριστικά</a></li>
              <li><a href="#readers" className="text-white/70 hover:text-white transition-colors">Καφετζούδες</a></li>
              <li><a href="#pricing" className="text-white/70 hover:text-white transition-colors">Τιμές</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-golden">Επικοινωνία</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-white/70" />
                <span className="text-white/70 text-sm">hello@aikafetzou.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-white/70" />
                <span className="text-white/70 text-sm">+30 210 123 4567</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-sm">
            © 2024 AI Kafetzou. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Πολιτική Απορρήτου</a>
            <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Όροι Χρήσης</a>
            <div className="flex items-center space-x-1 text-white/60 text-sm">
              <span>Φτιαγμένο με</span>
              <Heart className="h-3 w-3 text-rose-gold fill-current" />
              <span>στην Αθήνα</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;