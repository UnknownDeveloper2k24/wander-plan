import { Link } from "react-router-dom";
import { ArrowRight, Star, Globe } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="pt-28 pb-12 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border text-sm font-medium text-muted-foreground mb-8">
          <Star className="w-3.5 h-3.5" />
          <span>→</span>
          <Globe className="w-3.5 h-3.5 text-primary" />
          Explore world
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-[4.5rem] font-extrabold text-foreground leading-[1.08] tracking-tight">
          Make Your{" "}
          <span
            className="text-primary italic font-normal"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Dream Vacation
          </span>
          <br />
          Unforgettable!
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Get your dream trip planned with expert-guided destinations,
          booking, transport & more — all in one
        </p>

        {/* CTA */}
        <div className="mt-8">
          <Link
            to="/auth?mode=signup"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Start Planning
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
