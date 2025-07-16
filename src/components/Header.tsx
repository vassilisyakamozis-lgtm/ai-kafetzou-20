import { Button } from "@/components/ui/button";
import { Crown, Sparkles, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logoIcon from "@/assets/logo-icon.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-mystical-purple/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative">
              <img src="/lovable-uploads/bb07a43a-7bc4-4220-b603-524ea88d69e1.png" alt="Ai Kafetzou" className="h-8 w-8 animate-mystical-glow" />
            </div>
            <div>
              <h1 className="text-xl font-mystical font-bold text-mystical-purple">
                AI Kafetzou
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">Mystical Oracle</p>
            </div>
          </Link>

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

          {/* Auth Section */}
          <div className="flex items-center space-x-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ''} alt={profile?.display_name || ''} />
                      <AvatarFallback>
                        {profile?.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.display_name || 'Χρήστης'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Προφίλ</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Αποσύνδεση</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Σύνδεση
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="mystical" size="sm">
                    Εγγραφή
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;