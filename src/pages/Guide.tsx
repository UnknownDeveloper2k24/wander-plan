import { Star, Bookmark, Search, MapPin, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Guide() {
  const [searchQuery, setSearchQuery] = useState("");
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      // Use AI to generate travel guides for the destination
      const res = await supabase.functions.invoke("ai-planner", {
        body: {
          action: "plan-itinerary",
          destination: searchQuery,
          days: 3,
          travelers: 2,
          budget: 30000,
          interests: ["culture", "food", "sightseeing"],
          tripType: "leisure",
        },
      });

      if (res.error) throw new Error(res.error.message);

      // Transform activities into guide-like cards
      const activities = res.data?.activities || [];
      const guideCards = activities.slice(0, 6).map((a: any, i: number) => ({
        id: i,
        title: a.name,
        description: a.description || a.notes || "",
        location: a.location_name || searchQuery,
        category: a.category,
        cost: a.cost,
        rating: a.review_score || 4.5,
      }));

      setGuides(guideCards);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Travel Guide</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Get AI-curated travel recommendations for any Indian destination
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search a destination... e.g. Jaipur, Goa, Kerala"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-card"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Guide"}
        </button>
      </div>

      {!searched ? (
        <div className="text-center py-20">
          <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground text-lg">Search for AI travel guides</h3>
          <p className="text-sm text-muted-foreground mt-1">Our AI will create personalized travel recommendations</p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">AI is generating your travel guide...</p>
        </div>
      ) : guides.length === 0 ? (
        <div className="text-center py-20">
          <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground">No recommendations found</h3>
          <p className="text-sm text-muted-foreground mt-1">Try a different destination</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className="bg-card rounded-2xl p-5 shadow-card hover:shadow-elevated transition-all cursor-pointer animate-fade-in"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-card-foreground">{guide.title}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{guide.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-warning fill-warning" />
                  <span className="text-xs font-semibold">{guide.rating}</span>
                </div>
              </div>
              {guide.description && (
                <p className="text-sm text-muted-foreground mb-3">{guide.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-secondary text-xs font-medium text-secondary-foreground capitalize">
                  {guide.category || "general"}
                </span>
                {guide.cost > 0 && (
                  <span className="text-sm font-semibold text-card-foreground">₹{guide.cost.toLocaleString("en-IN")}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
