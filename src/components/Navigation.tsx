import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  User, 
  LogIn, 
  Settings,
  MapPin,
  Calendar,
  UserCheck
} from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navigationLinks = [
    { name: "Home", path: "/", icon: null },
    { name: "Book Ride", path: "/book", icon: Calendar },
    { name: "For Drivers", path: "/drivers", icon: User },
    { name: "For Garages", path: "/garages", icon: Settings },
    { name: "For Airlines", path: "/airlines", icon: MapPin },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur-md border-b border-border shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-sky rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">SkyWay</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/signup">
                <UserCheck className="h-4 w-4" />
                Sign Up
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t border-border">
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(link.path)
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{link.name}</span>
                  </Link>
                );
              })}
              <div className="pt-4 space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <LogIn className="h-4 w-4" />
                    Login
                  </Link>
                </Button>
                <Button variant="hero" className="w-full" asChild>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <UserCheck className="h-4 w-4" />
                    Sign Up
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;