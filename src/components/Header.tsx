import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, Coffee } from "lucide-react";

const Header = () => {
  const { user, signOut, profile } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-sm border-b border-gray-custom-border/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Coffee className="h-5 w-5 text-navy" />
            </div>
            <span className="text-xl font-serif font-semibold text-white">
              AI Kafetzou
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/#features" 
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Χαρακτηριστικά
            </Link>
            <Link 
              to="/#readers" 
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Αναγνώστες
            </Link>
            <Link 
              to="/#pricing" 
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Τιμές
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.display_name || "User"} />
                      <AvatarFallback className="bg-white text-navy">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem className="flex-col items-start">
                    <div className="text-sm font-medium">{profile?.display_name || "Χρήστης"}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Αποσύνδεση</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10">
                  <Link to="/auth">Σύνδεση</Link>
                </Button>
                <Button size="sm" asChild className="bg-white text-navy hover:bg-white/90">
                  <Link to="/auth">Εγγραφή</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;