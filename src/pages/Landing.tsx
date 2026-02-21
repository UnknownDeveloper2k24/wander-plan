import { Link } from "react-router-dom";
import { MapPin, Compass, Users, Mic, Brain, RefreshCw, ArrowRight, Star, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Voice-First Planning",
    description: "Just speak your travel dreams. Our AI understands natural language and builds your itinerary instantly.",
  },
  {
    icon: Brain,
    title: "AI-Powered Itineraries",
    description: "Regret-aware planning engine generates multiple optimized variants so you never miss the best experience.",
  },
  {
    icon: Users,
    title: "Group Travel Made Easy",
    description: "Personal AI proxies negotiate on behalf of each traveler to find the perfect consensus itinerary.",
  },
  {
    icon: RefreshCw,
    title: "Dynamic Replanning",
    description: "Flight delayed? Weather changed? Our system detects disruptions and replans in real-time.",
  },
  {
    icon: Compass,
    title: "Smart Discovery",
    description: "Explore curated attractions, restaurants, and hidden gems powered by local insights and reviews.",
  },
  {
    icon: Shield,
    title: "Budget Protection",
    description: "All prices in ₹ INR. Track spending, compare options, and stay within your budget effortlessly.",
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Mumbai",
    text: "Planned our entire Goa trip in 5 minutes with voice commands. The group negotiation feature is brilliant!",
    rating: 5,
  },
  {
    name: "Rahul Mehta",
    location: "Delhi",
    text: "When our flight got delayed, Radiator Routes instantly replanned our Jaipur itinerary. Lifesaver!",
    rating: 5,
  },
  {
    name: "Ananya Reddy",
    location: "Bangalore",
    text: "The AI understood exactly what our family needed. Budget-friendly yet packed with amazing experiences.",
    rating: 5,
  },
];

const stats = [
  { value: "50K+", label: "Trips Planned" },
  { value: "₹2Cr+", label: "Saved for Travelers" },
  { value: "200+", label: "Indian Destinations" },
  { value: "4.9★", label: "User Rating" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
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
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            AI-Powered Group Travel Intelligence
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground leading-tight max-w-4xl mx-auto">
            Plan trips that
            <span className="text-primary"> everyone </span>
            loves
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Voice-first, AI-driven travel planning for groups. Speak your dream trip, let personal AI proxies negotiate,
            and get regret-minimized itineraries — all in ₹ INR.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              to="/auth?mode=signup"
              className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground text-base font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-elevated"
            >
              Start Planning
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-3.5 rounded-xl bg-card border border-border text-foreground text-base font-medium hover:bg-secondary transition-colors shadow-card"
            >
              See How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Everything you need for the perfect trip</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              From voice planning to real-time disruption handling, we've got every angle covered.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-background border border-border hover:shadow-elevated transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">How Radiator Routes works</h2>
            <p className="text-muted-foreground mt-3">Three simple steps to your perfect group trip</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Speak or Type", desc: "Tell us where you want to go, your budget in ₹, group size, and interests. Our AI extracts intent instantly." },
              { step: "02", title: "AI Negotiates", desc: "Personal AI proxies represent each traveler's preferences and negotiate a consensus itinerary." },
              { step: "03", title: "Travel & Adapt", desc: "Get real-time updates. If plans change, our engine replans automatically." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground text-2xl font-extrabold flex items-center justify-center mx-auto mb-5">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Loved by Indian travelers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl bg-background border border-border">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed">"{t.text}"</p>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Ready to plan your next adventure?</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Join thousands of Indian travelers who plan smarter with AI. All prices in ₹ INR.
          </p>
          <Link
            to="/auth?mode=signup"
            className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground text-base font-semibold hover:opacity-90 transition-opacity shadow-elevated"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">Radiator Routes</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Radiator Routes. Made with ❤️ in India.</p>
        </div>
      </footer>
    </div>
  );
}
