import { useState } from "react";
import { Search, Star, Heart, MapPin, Loader2, X, Map, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import WorldMap from "@/components/WorldMap";
import ARViewer from "@/components/ARViewer";

import destinationAgra from "@/assets/destination-agra.jpg";
import destinationGoa from "@/assets/destination-goa.jpg";
import destinationKerala from "@/assets/destination-kerala.jpg";
import travelBeach from "@/assets/travel-beach.jpg";
import travelBoat from "@/assets/travel-boat.jpg";
import travelKayak from "@/assets/travel-kayak.jpg";

const fallbackImages = [destinationAgra, destinationGoa, destinationKerala, travelBeach, travelBoat, travelKayak];

const categories = ["All", "Cultural", "Natural", "Historic", "Architecture", "Religion"];

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [arPlace, setArPlace] = useState<any | null>(null);
  const { toast } = useToast();

  const handleSearch = async (filterOverride?: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);

    const currentFilter = filterOverride || activeFilter;

    try {
      const geoRes = await supabase.functions.invoke("nominatim", {
        body: { action: "search", query: searchQuery, limit: 1 },
      });

      if (geoRes.error || !geoRes.data || geoRes.data.length === 0) {
        toast({ title: "Location not found", description: "Try a different search term.", variant: "destructive" });
        setPlaces([]);
        setLoading(false);
        return;
      }

      const { lat, lon } = geoRes.data[0];

      const kinds = currentFilter === "All" ? "interesting_places" : currentFilter.toLowerCase();
      const placesRes = await supabase.functions.invoke("opentripmap", {
        body: { action: "radius", lat: parseFloat(lat), lon: parseFloat(lon), radius: 10000, kinds, limit: 30 },
      });

      if (placesRes.error) throw new Error(placesRes.error.message);

      const raw = placesRes.data;
      const items = raw?.features
        ? raw.features.map((f: any) => ({ ...f.properties, point: f.geometry }))
        : Array.isArray(raw) ? raw : [];

      // Fetch details sequentially with delay to avoid rate limiting
      const detailed: any[] = [];
      for (const p of items.slice(0, 8)) {
        if (!p.xid) continue;
        try {
          const detailRes = await supabase.functions.invoke("opentripmap", {
            body: { action: "details", xid: p.xid },
          });
          if (detailRes.data) detailed.push(detailRes.data);
          await new Promise(r => setTimeout(r, 250));
        } catch {
          detailed.push({ ...p, name: p.name || "Unknown Place" });
        }
      }

      const results = detailed.filter((p: any) => p.name && p.name.trim() !== "");
      setPlaces(results);

      if (results.length === 0) {
        toast({ title: "No named places found", description: "Try a broader search or different category." });
      }
    } catch (error: any) {
      toast({ title: "Search failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    if (searched && searchQuery.trim()) {
      handleSearch(filter);
    }
  };

  const handleCardClick = (place: any) => {
    setSelectedPlace(place);
    setShowMap(true);
  };

  const getPlaceCoords = (place: any) => {
    const lat = place.point?.coordinates?.[1] ?? place.point?.lat ?? place.lat;
    const lng = place.point?.coordinates?.[0] ?? place.point?.lon ?? place.lon ?? place.lng;
    return { lat: parseFloat(lat), lng: parseFloat(lng) };
  };

  const openAR = (place: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const coords = getPlaceCoords(place);
    if (isNaN(coords.lat) || isNaN(coords.lng)) {
      toast({ title: "Location unavailable", description: "No coordinates for this place.", variant: "destructive" });
      return;
    }
    setArPlace({ ...place, ...coords });
  };

  return (
    <div className="p-6 h-screen overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Explore Destinations</h1>
          <p className="text-sm text-muted-foreground mt-1">Discover amazing places for your next adventure</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search a city or destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-card"
          />
        </div>
        <button
          onClick={() => handleSearch()}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {categories.map((f) => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
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

      {/* AR Viewer */}
      {arPlace && (
        <ARViewer
          lat={arPlace.lat}
          lng={arPlace.lng}
          name={arPlace.name}
          description={arPlace.wikipedia_extracts?.text?.slice(0, 120)}
          onClose={() => setArPlace(null)}
        />
      )}

      {/* Detail Modal with Map */}
      {selectedPlace && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => { setSelectedPlace(null); setShowMap(false); }}>
          <div className="bg-card rounded-2xl max-w-2xl w-full overflow-hidden shadow-elevated animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col md:flex-row">
              {/* Left: Image + Details */}
              <div className="flex-1">
                <div className="relative h-48">
                  <img
                    src={selectedPlace.preview?.source || fallbackImages[0]}
                    alt={selectedPlace.name}
                    className="w-full h-full object-cover"
                  />
                  <button onClick={() => { setSelectedPlace(null); setShowMap(false); }} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center">
                    <X className="w-4 h-4 text-foreground" />
                  </button>
                </div>
                <div className="p-5 space-y-3">
                  <h2 className="text-lg font-bold text-card-foreground">{selectedPlace.name}</h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    {selectedPlace.address?.city && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {[selectedPlace.address.city, selectedPlace.address.state, selectedPlace.address.country].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {selectedPlace.rate > 0 && (
                      <span className="flex items-center gap-1 text-xs text-warning font-semibold">
                        <Star className="w-3 h-3 fill-warning" />{selectedPlace.rate}/7
                      </span>
                    )}
                  </div>
                  {selectedPlace.kinds && (
                    <div className="flex gap-1.5 flex-wrap">
                      {selectedPlace.kinds.split(",").slice(0, 5).map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-secondary text-xs font-medium text-secondary-foreground capitalize">
                          {tag.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  )}
                  {selectedPlace.wikipedia_extracts?.text && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{selectedPlace.wikipedia_extracts.text}</p>
                  )}
                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => openAR(selectedPlace)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      <Eye className="w-4 h-4" />
                      AR/VR View
                    </button>
                    {selectedPlace.url && (
                      <a href={selectedPlace.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
                        Learn more →
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Map */}
              {showMap && (() => {
                const coords = getPlaceCoords(selectedPlace);
                return !isNaN(coords.lat) && !isNaN(coords.lng) ? (
                  <div className="w-full md:w-[300px] h-[250px] md:h-auto shrink-0 border-t md:border-t-0 md:border-l border-border">
                    <WorldMap
                      lat={coords.lat}
                      lng={coords.lng}
                      name={selectedPlace.name}
                      zoom={15}
                      className="w-full h-full min-h-[250px]"
                    />
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {!searched ? (
          <div className="text-center py-20">
            <Compass className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground text-lg">Search to discover places</h3>
            <p className="text-sm text-muted-foreground mt-1">Try "Jaipur", "Goa", "Rishikesh" and more</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground">No places found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try a different location or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {places.map((place, i) => {
              const coords = getPlaceCoords(place);
              const hasCoords = !isNaN(coords.lat) && !isNaN(coords.lng);

              return (
                <div
                  key={place.xid || i}
                  onClick={() => handleCardClick(place)}
                  className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="relative h-44 overflow-hidden bg-primary/5">
                    <img
                      src={place.preview?.source || fallbackImages[i % fallbackImages.length]}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      {hasCoords && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openAR(place, e); }}
                          className="w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
                          title="AR/VR View"
                        >
                          <Eye className="w-4 h-4 text-primary" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
                      >
                        <Heart className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                    {hasCoords && (
                      <div className="absolute bottom-3 left-3 bg-card/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                        <Map className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-medium text-card-foreground">View on map</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-card-foreground">{place.name}</h3>
                    {place.address?.city && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {[place.address.city, place.address.state].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                    {place.rate > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-3 h-3 text-warning fill-warning" />
                        <span className="text-xs font-semibold text-card-foreground">{place.rate}</span>
                      </div>
                    )}
                    {place.kinds && (
                      <div className="flex gap-1.5 mt-3 flex-wrap">
                        {place.kinds.split(",").slice(0, 3).map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-secondary text-xs font-medium text-secondary-foreground capitalize">
                            {tag.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Compass(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  );
}
