import { Star, Bookmark, Search } from "lucide-react";
import { guides } from "@/data/mockData";

export default function Guide() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Travel Guides</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Curated guides from fellow travelers
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search guides..."
            className="pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm w-56 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-card"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {guides.map((guide, i) => (
          <div
            key={guide.id}
            className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all cursor-pointer group animate-fade-in"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src={guide.image}
                alt={guide.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-lg font-bold text-card" style={{ color: "white" }}>
                  {guide.title}
                </h3>
                <p className="text-xs text-card/80 mt-0.5" style={{ color: "rgba(255,255,255,0.8)" }}>
                  {guide.destination}
                </p>
              </div>
              <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors">
                <Bookmark className="w-4 h-4 text-primary" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">By</span>
                  <span className="text-xs font-semibold text-card-foreground">{guide.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-warning fill-warning" />
                  <span className="text-xs font-semibold">{guide.rating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-1.5 flex-wrap">
                  {guide.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-secondary text-xs font-medium text-secondary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{guide.saves} saves</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
