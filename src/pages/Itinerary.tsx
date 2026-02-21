import { useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPin, Clock, Utensils, Camera, ShoppingBag, Bus, MessageSquare, ThumbsUp, Edit, Plus, IndianRupee } from "lucide-react";
import { useTrip, useItineraries, useActivities } from "@/hooks/useTrips";

const typeIcons: Record<string, React.ReactNode> = {
  food: <Utensils className="w-4 h-4" />,
  attraction: <Camera className="w-4 h-4" />,
  transport: <Bus className="w-4 h-4" />,
  shopping: <ShoppingBag className="w-4 h-4" />,
};

const typeColors: Record<string, string> = {
  food: "bg-warning/10 text-warning",
  attraction: "bg-accent/10 text-accent",
  transport: "bg-success/10 text-success",
  shopping: "bg-primary/10 text-primary",
};

export default function Itinerary() {
  const { tripId } = useParams();
  const { data: trip } = useTrip(tripId);
  const { data: itineraries = [] } = useItineraries(tripId);
  const activeItinerary = itineraries[0];
  const { data: activities = [] } = useActivities(activeItinerary?.id);

  // Group activities by day
  const activityDays = activities.reduce((acc, activity) => {
    const day = new Date(activity.start_time).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    if (!acc[day]) acc[day] = [];
    acc[day].push(activity);
    return acc;
  }, {} as Record<string, typeof activities>);

  const days = Object.keys(activityDays);
  const [selectedDay, setSelectedDay] = useState(0);

  if (!tripId) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-20">
          <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Select a Trip</h1>
          <p className="text-muted-foreground">Choose a trip from the sidebar or create a new one from the dashboard.</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentDayActivities = days.length > 0 ? activityDays[days[selectedDay]] || [] : [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{trip.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {trip.destination} · Budget: ₹{Number(trip.budget_total).toLocaleString("en-IN")} · {trip.status}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl bg-card border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors shadow-card flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
          <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shadow-card flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      {/* Trip Info */}
      <div className="bg-card rounded-2xl p-5 shadow-card mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Destination</p>
            <p className="text-sm font-bold text-card-foreground">{trip.destination}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Budget</p>
            <p className="text-sm font-bold text-card-foreground flex items-center justify-center gap-0.5">
              <IndianRupee className="w-3 h-3" />
              {Number(trip.budget_total).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Start</p>
            <p className="text-sm font-bold text-card-foreground">
              {new Date(trip.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">End</p>
            <p className="text-sm font-bold text-card-foreground">
              {new Date(trip.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </p>
          </div>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 text-center shadow-card">
          <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-card-foreground">No activities yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Activities will appear here once the AI generates your itinerary.
          </p>
        </div>
      ) : (
        <>
          {/* Day Selector */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setSelectedDay((d) => Math.max(0, d - 1))}
              className="p-2 rounded-xl bg-card border border-border hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="flex gap-2 overflow-x-auto">
              {days.map((day, i) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(i)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedDay === i
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedDay((d) => Math.min(days.length - 1, d + 1))}
              className="p-2 rounded-xl bg-card border border-border hover:bg-secondary transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Timeline */}
          <div className="space-y-1">
            {currentDayActivities.map((activity, i) => (
              <div key={activity.id} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColors[activity.category || "other"] || "bg-secondary text-muted-foreground"}`}>
                    {typeIcons[activity.category || "other"] || <MapPin className="w-4 h-4" />}
                  </div>
                  {i < currentDayActivities.length - 1 && (
                    <div className="w-px flex-1 bg-border my-1" />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="bg-card rounded-2xl p-4 shadow-card hover:shadow-elevated transition-shadow group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-card-foreground text-sm">{activity.name}</h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(activity.start_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {activity.cost && (
                            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                              <IndianRupee className="w-3 h-3" />
                              {Number(activity.cost).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {activity.notes && (
                      <p className="text-xs text-muted-foreground mt-2 bg-secondary/50 px-3 py-1.5 rounded-lg">
                        💡 {activity.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
