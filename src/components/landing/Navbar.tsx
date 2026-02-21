import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">Radiator Routes</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
          <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/auth?mode=signup"
            className="px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
