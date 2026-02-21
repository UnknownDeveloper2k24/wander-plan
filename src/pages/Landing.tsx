import { Link } from "react-router-dom";
import { Mic, Brain, Users, RefreshCw, Compass, Shield, Star, ArrowRight, MapPin } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import LogoBar from "@/components/landing/LogoBar";
import PhotoGallery from "@/components/landing/PhotoGallery";

const features = [
  { icon: Mic, title: "Voice-First Planning", description: "Just speak your travel dreams. Our AI understands natural language and builds your itinerary instantly." },
  { icon: Brain, title: "AI-Powered Itineraries", description: "Regret-aware planning engine generates multiple optimized variants so you never miss the best experience." },
  { icon: Users, title: "Group Travel Made Easy", description: "Personal AI proxies negotiate on behalf of each traveler to find the perfect consensus itinerary." },
  { icon: RefreshCw, title: "Dynamic Replanning", description: "Flight delayed? Weather changed? Our system detects disruptions and replans in real-time." },
  { icon: Compass, title: "Smart Discovery", description: "Explore curated attractions, restaurants, and hidden gems powered by local insights and reviews." },
  { icon: Shield, title: "Budget Protection", description: "All prices in ₹ INR. Track spending, compare options, and stay within your budget effortlessly." },
];

const testimonials = [
  { name: "Priya Sharma", location: "Mumbai", text: "Planned our entire Goa trip in 5 minutes with voice commands. The group negotiation feature is brilliant!", rating: 5 },
  { name: "Rahul Mehta", location: "Delhi", text: "When our flight got delayed, Radiator Routes instantly replanned our Jaipur itinerary. Lifesaver!", rating: 5 },
  { name: "Ananya Reddy", location: "Bangalore", text: "The AI understood exactly what our family needed. Budget-friendly yet packed with amazing experiences.", rating: 5 },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <LogoBar />
      <PhotoGallery />

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Everything you need for the perfect trip</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">From voice planning to real-time disruption handling, we've got every angle covered.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="p-6 rounded-2xl bg-background border border-border hover:shadow-elevated transition-all group cursor-pointer">
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
                <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground text-2xl font-extrabold flex items-center justify-center mx-auto mb-5">{item.step}</div>
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
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Join thousands of Indian travelers who plan smarter with AI. All prices in ₹ INR.</p>
          <Link to="/auth?mode=signup" className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-foreground text-background text-base font-semibold hover:opacity-90 transition-opacity shadow-elevated">
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
