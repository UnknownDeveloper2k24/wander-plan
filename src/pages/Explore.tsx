import { useState } from "react";
import { Search, Star, Heart, MapPin, Filter } from "lucide-react";
import { exploreCards } from "@/data/mockData";

const filters = ["All", "Landmark", "Experience", "Temple", "Nature", "Market", "District"];
const moods = ["All Moods", "Adventurous", "Cultural", "Peaceful", "Exciting", "Fun"];

export default function Explore() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeMood, setActiveMood] = useState("All Moods");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = exploreCards.filter((card) => {
    const matchesFilter = activeFilter === "All" || card.category === activeFilter;
    const matchesMood = activeMood === "All Moods" || card.mood === activeMood;
    const matchesSearch =
      !searchQuery || card.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesMood && matchesSearch;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Explore</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Discover amazing places for your next adventure
          </p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search places, activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-card"
          />
        </div>
        <button className="p-2.5 rounded-xl bg-card border border-border hover:bg-secondary transition-colors shadow-card">
          <Filter className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === f
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Mood Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {moods.map((m) => (
          <button
            key={m}
            onClick={() => setActiveMood(m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeMood === m
                ? "bg-accent text-accent-foreground"
                : "bg-secondary text-muted-foreground hover:text-secondary-foreground"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((card, i) => (
          <div
            key={card.id}
            className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all cursor-pointer group animate-fade-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src={card.image}
                alt={card.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors">
                <Heart className="w-4 h-4 text-primary" />
              </button>
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-card/80 backdrop-blur-sm text-xs font-semibold text-card-foreground">
                {card.budget}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-card-foreground">{card.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{card.location}</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-3 h-3 text-warning fill-warning" />
                <span className="text-xs font-semibold text-card-foreground">{card.rating}</span>
                <span className="text-xs text-muted-foreground">({card.reviews})</span>
              </div>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-secondary text-xs font-medium text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button className="mt-3 w-full py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors">
                Save to Trip
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
