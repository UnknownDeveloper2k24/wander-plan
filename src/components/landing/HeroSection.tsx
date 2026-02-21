import { Link } from "react-router-dom";
import { ArrowRight, Star, Globe } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="pt-32 pb-16 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-card border border-border text-sm font-medium text-foreground mb-8">
          <Star className="w-4 h-4 text-warning" />
          <span className="text-muted-foreground">→</span>
          <Globe className="w-4 h-4 text-primary" />
          Explore the world
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-foreground leading-[1.1]">
          Make Your{" "}
          <span
            className="text-primary font-serif italic"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Dream Vacation
          </span>
          <br />
          Unforgettable!
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Get your dream trip planned with expert-guided destinations,
          booking, transport & more — all in one place, all in ₹ INR.
        </p>

        <div className="mt-10">
          <Link
            to="/auth?mode=signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-foreground text-background text-base font-semibold hover:opacity-90 transition-opacity shadow-elevated"
          >
            Start Planning
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
