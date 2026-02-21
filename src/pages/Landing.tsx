import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Mic, Brain, Users, RefreshCw, Compass, Star, ChevronRight, Shield, Quote, Globe } from "lucide-react";
import { useState } from "react";

// Image imports
import heroOcean from "@/assets/hero-ocean.jpg";
import aboutTemple from "@/assets/about-temple.jpg";
import aboutFriends from "@/assets/about-friends.jpg";
import featureVoice from "@/assets/feature-voice.jpg";
import travelBeach from "@/assets/travel-beach.jpg";
import travelHiker from "@/assets/travel-hiker.jpg";
import travelBoat from "@/assets/travel-boat.jpg";
import travelKayak from "@/assets/travel-kayak.jpg";
import travelSummit from "@/assets/travel-summit.jpg";
import travelOcean from "@/assets/travel-ocean.jpg";
import destinationGoa from "@/assets/destination-goa.jpg";
import destinationAgra from "@/assets/destination-agra.jpg";
import destinationKerala from "@/assets/destination-kerala.jpg";

/* ─── Data ─── */

const reasons = [
  {
    id: "voice",
    label: "Voice-First",
    title: "Voice-First Planning",
    description: "Just speak your travel dreams — our multimodal NLU pipeline powered by Whisper + GPT extracts destinations, dates, budget, group size, and interests from natural speech. No forms, no friction.",
    icon: Mic,
  },
  {
    id: "ai",
    label: "AI Itineraries",
    title: "Regret-Aware AI Itineraries",
    description: "Our counterfactual planning engine generates multiple optimized itinerary variants and uses regret minimization to pick the one where no traveler misses out on their must-have experiences.",
    icon: Brain,
  },
  {
    id: "group",
    label: "Group Travel",
    title: "Multi-Agent Group Negotiation",
    description: "Each group member gets a personal AI proxy that advocates for their preferences. These agents negotiate autonomously using Nash equilibrium-inspired consensus to build the perfect group itinerary.",
    icon: Users,
  },
  {
    id: "replan",
    label: "Dynamic Replan",
    title: "Real-Time Dynamic Replanning",
    description: "Flight delayed? Weather changed? Our event-driven system detects disruptions via Amadeus & OpenWeatherMap APIs, then instantly replans your itinerary with minimal regret — all via WebSocket push.",
    icon: RefreshCw,
  },
  {
    id: "discover",
    label: "Smart Discovery",
    title: "Intelligent Place Discovery",
    description: "Explore curated attractions, restaurants, and hidden gems powered by OpenTripMap & TomTom. Our semantic search uses pgvector embeddings to match places with your unique travel personality.",
    icon: Compass,
  },
];

const destinations = [
  { name: "Goa Beaches", desc: "Sun, sand & serenity on India's finest coastline", image: destinationGoa },
  { name: "Agra Heritage", desc: "Walk through centuries of Mughal grandeur", image: destinationAgra },
  { name: "Kerala Backwaters", desc: "Cruise through tranquil palm-fringed waterways", image: destinationKerala },
];

const testimonials = [
  { name: "Priya Sharma", location: "Mumbai", text: "Planned our entire Goa trip in 5 minutes with voice commands. The group negotiation feature is brilliant — everyone in our squad was happy!", rating: 5 },
  { name: "Rahul Mehta", location: "Delhi", text: "When our flight got delayed, Radiator Routes instantly replanned our Jaipur itinerary. Absolute lifesaver for group travel.", rating: 5 },
  { name: "Ananya Reddy", location: "Bangalore", text: "The AI understood exactly what our family needed. Budget-friendly yet packed with amazing experiences. All in ₹ — no conversion hassle!", rating: 5 },
];

const tripTypes = [
  { title: "Beach & Relaxation", image: travelBeach },
  { title: "Mountain Adventure", image: travelHiker },
  { title: "Cultural Heritage", image: travelBoat },
  { title: "Water Sports", image: travelKayak },
];

/* ─── Component ─── */

export default function Landing() {
  const [activeReason, setActiveReason] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Radiator Routes</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#about" className="text-sm font-medium text-white/70 hover:text-white transition-colors">About</a>
            <a href="#features" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Features</a>
            <a href="#destinations" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Destinations</a>
            <a href="#testimonials" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors">Log in</Link>
            <Link to="/auth?mode=signup" className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">Register</Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero (Full-width dark image like Pesona Timur) ─── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <img src={heroOcean} alt="Aerial ocean view" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

        {/* Vertical numbered dots (left side) */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-6 z-10">
          {[1, 2, 3].map((n) => (
            <div key={n} className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white/60 text-xs font-medium">{n}</div>
          ))}
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <p className="text-white/70 uppercase tracking-[0.3em] text-sm font-medium mb-4">Let us plan your perfect</p>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-white leading-[0.95] tracking-tight">
            Group
            <br />
            <span
              className="italic font-normal text-primary"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Travel
            </span>
          </h1>

          {/* Floating feature cards at bottom */}
          <div className="mt-12 flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-semibold italic" style={{ fontFamily: "'Playfair Display', serif" }}>Voice</p>
                <p className="text-white/60 text-xs">Speak your plans</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-semibold italic" style={{ fontFamily: "'Playfair Display', serif" }}>AI Plan</p>
                <p className="text-white/60 text-xs">Regret-minimized</p>
              </div>
            </div>
          </div>
        </div>

        {/* "Know More" bottom-left card */}
        <div className="absolute bottom-8 left-8 z-10 hidden md:flex items-center gap-3">
          <span className="text-white font-semibold text-sm italic" style={{ fontFamily: "'Playfair Display', serif" }}>Know More</span>
          <a href="#about" className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ─── About Section ─── */}
      <section id="about" className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>About</h2>

          {/* Image grid (like the L-O-M-B layout) */}
          <div className="grid grid-cols-4 gap-3 mb-10 max-w-2xl mx-auto">
            <div className="rounded-2xl overflow-hidden aspect-square">
              <img src={travelBeach} alt="Beach" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square">
              <img src={aboutTemple} alt="Temple" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square">
              <img src={aboutFriends} alt="Friends" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square">
              <img src={travelKayak} alt="Adventure" className="w-full h-full object-cover" />
            </div>
          </div>

          <p className="text-center text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base">
            Radiator Routes is an AI-powered intelligent travel planning system designed for group travel optimization.
            We combine voice-first interaction, regret-aware counterfactual planning, multi-agent AI orchestration,
            and real-time dynamic replanning to deliver the perfect trip — every time. All budgets tracked in ₹ INR,
            powered by LangGraph agent workflows and Supabase real-time infrastructure.
          </p>
        </div>
      </section>

      {/* ─── 5 Reasons Section (with tabs like Pesona Timur) ─── */}
      <section id="features" className="py-20 px-6 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            5 Reasons Why You
            <br />Should Use Radiator Routes
          </h2>
          <p className="text-muted-foreground text-center mb-14 max-w-xl mx-auto">
            Built with cutting-edge AI architecture from our SOP
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Image side */}
            <div className="rounded-3xl overflow-hidden aspect-[4/5] relative">
              <img src={featureVoice} alt="Voice planning" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Tabs side */}
            <div className="space-y-2">
              {reasons.map((reason, i) => (
                <button
                  key={reason.id}
                  onClick={() => setActiveReason(i)}
                  className={`w-full text-left p-5 rounded-2xl transition-all ${
                    activeReason === i
                      ? "bg-background border border-border shadow-elevated"
                      : "hover:bg-background/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Feature {String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <reason.icon className={`w-5 h-5 flex-shrink-0 ${activeReason === i ? "text-primary" : "text-muted-foreground"}`} />
                    <h3 className="text-lg font-semibold text-foreground">{reason.title}</h3>
                  </div>
                  {activeReason === i && (
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed pl-8">
                      {reason.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Quote Section (overlaid on image) ─── */}
      <section className="relative py-32 px-6 overflow-hidden">
        <img src={travelSummit} alt="Summit" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <Quote className="w-10 h-10 text-primary mx-auto mb-6" />
          <p className="text-3xl md:text-4xl text-white font-bold leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sometimes you will never know the value of a moment until it becomes a memory.
          </p>
          <p className="text-white/60 mt-6 text-sm">— Dr. Seuss</p>
        </div>
      </section>

      {/* ─── Journey / Destinations Section ─── */}
      <section id="destinations" className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Journey of
            <br />India
          </h2>
          <p className="text-muted-foreground text-center mb-14 max-w-xl mx-auto">
            200+ Indian destinations optimized with AI-powered itineraries
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {destinations.map((dest) => (
              <div key={dest.name} className="group cursor-pointer">
                <div className="rounded-2xl overflow-hidden aspect-[4/3] mb-4">
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{dest.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{dest.desc}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-colors">
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trip Plan / Browse Types ─── */}
      <section className="py-20 px-6 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Trip Plan</h2>
              <p className="text-muted-foreground mt-2">Browse trip types and interests</p>
            </div>
            <p className="hidden md:block text-sm text-muted-foreground max-w-xs text-right">
              Our AI planner creates regret-minimized itineraries tailored for every travel style
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tripTypes.map((type) => (
              <div key={type.title} className="group cursor-pointer">
                <div className="rounded-2xl overflow-hidden aspect-[3/4] relative">
                  <img src={type.image} alt={type.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <p className="absolute bottom-4 left-4 text-white font-semibold text-sm">{type.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section id="testimonials" className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            What Our Clients
            <br />Say About Us
          </h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl bg-card border border-border">
                <Quote className="w-6 h-6 text-primary mb-4" />
                <p className="text-sm text-foreground leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-warning fill-warning" />
                  ))}
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Large CTA with image ─── */}
      <section className="relative py-32 px-6 overflow-hidden">
        <img src={destinationKerala} alt="Kerala backwaters" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Radiator Routes
          </h2>
          <p className="text-white/70 mb-8 max-w-lg mx-auto">
            AI-powered group travel intelligence. Voice-first planning. Regret-minimized itineraries. All in ₹ INR.
          </p>
          <Link
            to="/auth?mode=signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Start Planning
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-foreground text-background py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Radiator Routes</span>
            </div>
            <p className="text-sm text-background/60">AI-powered intelligent travel planning for group travel optimization.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li><a href="#features" className="hover:text-background transition-colors">Features</a></li>
              <li><a href="#destinations" className="hover:text-background transition-colors">Destinations</a></li>
              <li><Link to="/auth?mode=signup" className="hover:text-background transition-colors">Get Started</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Technology</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li>Voice NLU Pipeline</li>
              <li>LangGraph Agents</li>
              <li>Regret-Aware Engine</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Resources</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li><Link to="/auth" className="hover:text-background transition-colors">Sign In</Link></li>
              <li>API Documentation</li>
              <li>SOP Reference</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-background/10 flex items-center justify-between">
          <p className="text-xs text-background/40">© 2026 Radiator Routes. Made with ❤️ in India.</p>
          <Link to="/auth?mode=signup" className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
            Register
          </Link>
        </div>
      </footer>
    </div>
  );
}
