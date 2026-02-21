import { Search, Mic, Star, Heart, ExternalLink, Plus, MapPin, Calendar, IndianRupee } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTrips } from "@/hooks/useTrips";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: trips = [], isLoading } = useTrips();
  const { toast } = useToast();
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [newTrip, setNewTrip] = useState({
    name: "",
    destination: "",
    country: "India",
    start_date: "",
    end_date: "",
    budget_total: "",
  });
  const [creating, setCreating] = useState(false);

  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Traveler";

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { error } = await supabase.from("trips").insert({
        name: newTrip.name,
        destination: newTrip.destination,
        country: newTrip.country,
        start_date: newTrip.start_date,
        end_date: newTrip.end_date,
        budget_total: Number(newTrip.budget_total) || 0,
        organizer_id: user!.id,
      });
      if (error) throw error;
      toast({ title: "Trip created!", description: `${newTrip.destination} trip is ready.` });
      setShowNewTrip(false);
      setNewTrip({ name: "", destination: "", country: "India", start_date: "", end_date: "", budget_total: "" });
      // Refetch handled by react-query
      window.location.reload();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const upcomingTrips = trips.filter(
    (t) => new Date(t.start_date) > new Date() && t.status !== "completed"
  );

  const getDaysLeft = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="flex gap-6 p-6 h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Good Morning, {userName} 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Plan your itinerary with us</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search destinations..."
                className="pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-card"
              />
            </div>
            <button className="p-2.5 rounded-xl bg-card border border-border hover:bg-secondary transition-colors shadow-card">
              <Mic className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* New Trip Button */}
        <button
          onClick={() => setShowNewTrip(!showNewTrip)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-card"
        >
          <Plus className="w-4 h-4" />
          Create New Trip
        </button>

        {/* New Trip Form */}
        {showNewTrip && (
          <form onSubmit={handleCreateTrip} className="bg-card rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="font-semibold text-card-foreground">New Trip</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Trip name"
                value={newTrip.name}
                onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
                required
                className="px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                placeholder="Destination"
                value={newTrip.destination}
                onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                required
                className="px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="date"
                value={newTrip.start_date}
                onChange={(e) => setNewTrip({ ...newTrip, start_date: e.target.value })}
                required
                className="px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="date"
                value={newTrip.end_date}
                onChange={(e) => setNewTrip({ ...newTrip, end_date: e.target.value })}
                required
                className="px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                placeholder="Budget in ₹"
                type="number"
                value={newTrip.budget_total}
                onChange={(e) => setNewTrip({ ...newTrip, budget_total: e.target.value })}
                className="px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                placeholder="Country"
                value={newTrip.country}
                onChange={(e) => setNewTrip({ ...newTrip, country: e.target.value })}
                className="px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Trip"}
              </button>
              <button
                type="button"
                onClick={() => setShowNewTrip(false)}
                className="px-6 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Upcoming Trips */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">My Trips</h2>
              <p className="text-sm text-muted-foreground">
                {trips.length === 0 ? "Create your first trip to get started!" : `${trips.length} trip${trips.length !== 1 ? "s" : ""} planned`}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : trips.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 text-center shadow-card">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-card-foreground">No trips yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Create your first trip to start planning!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-shadow cursor-pointer group"
                >
                  <div className="relative h-32 overflow-hidden bg-primary/10">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-primary/30" />
                    </div>
                    <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-semibold">
                      <span className="text-foreground">{getDaysLeft(trip.start_date)} days left</span>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-primary-foreground ${
                        trip.status === 'planning' ? 'bg-warning' :
                        trip.status === 'booked' ? 'bg-success' :
                        trip.status === 'ongoing' ? 'bg-primary' : 'bg-muted-foreground'
                      }`}>
                        {trip.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-card-foreground text-sm">{trip.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {trip.destination}{trip.country ? `, ${trip.country}` : ""}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-bold text-card-foreground">
                          {Number(trip.budget_total).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(trip.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-[340px] shrink-0 space-y-6 overflow-y-auto">
        {/* Quick Stats */}
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <h3 className="font-semibold text-card-foreground mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-xl bg-primary/5">
              <p className="text-2xl font-bold text-primary">{trips.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Trips</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-success/10">
              <p className="text-2xl font-bold text-foreground">{upcomingTrips.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Upcoming</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-warning/10">
              <p className="text-2xl font-bold text-foreground">
                ₹{trips.reduce((sum, t) => sum + Number(t.budget_total || 0), 0).toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total Budget</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-accent/10">
              <p className="text-2xl font-bold text-foreground">
                {new Set(trips.map(t => t.destination)).size}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Destinations</p>
            </div>
          </div>
        </div>

        {/* Upcoming Trip Preview */}
        {upcomingTrips.length > 0 && (
          <div className="bg-card rounded-2xl p-5 shadow-card">
            <h3 className="font-semibold text-card-foreground mb-3">Next Trip</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-card-foreground">{upcomingTrips[0].name}</p>
                <p className="text-xs text-muted-foreground">{upcomingTrips[0].destination}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="text-sm font-bold text-card-foreground">₹{Number(upcomingTrips[0].budget_total).toLocaleString("en-IN")}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Days Left</p>
                  <p className="text-sm font-bold text-card-foreground">{getDaysLeft(upcomingTrips[0].start_date)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-bold text-card-foreground capitalize">{upcomingTrips[0].status}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
