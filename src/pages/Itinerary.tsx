import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock, Utensils, Camera, ShoppingBag, Bus, MessageSquare, ThumbsUp, Edit } from "lucide-react";
import { itineraryData } from "@/data/mockData";

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
  const [selectedDay, setSelectedDay] = useState(0);
  const day = itineraryData.days[selectedDay];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{itineraryData.tripName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Traveler: 👤 {itineraryData.traveler} · Budget: ${itineraryData.budget} · {itineraryData.duration}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl bg-card border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors shadow-card flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Comment
          </button>
          <button className="px-4 py-2 rounded-xl bg-card border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors shadow-card flex items-center gap-2">
            <ThumbsUp className="w-4 h-4" />
            Vote
          </button>
          <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shadow-card flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-48 rounded-2xl overflow-hidden mb-6 shadow-card">
        <img
          src={itineraryData.image}
          alt={itineraryData.tripName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
        <div className="absolute bottom-4 left-5 flex items-center gap-3">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Budget", value: `$${itineraryData.budget}` },
              { label: "Persons", value: itineraryData.persons },
              { label: "Duration", value: itineraryData.duration },
            ].map((item) => (
              <div key={item.label} className="bg-card/80 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
                <p className="text-sm font-bold text-card-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setSelectedDay((d) => Math.max(0, d - 1))}
          className="p-2 rounded-xl bg-card border border-border hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex gap-2 overflow-x-auto">
          {itineraryData.days.map((d, i) => (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                selectedDay === i
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              Day {d.day}
              <span className="block text-[10px] opacity-70">{d.date}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() =>
            setSelectedDay((d) => Math.min(itineraryData.days.length - 1, d + 1))
          }
          className="p-2 rounded-xl bg-card border border-border hover:bg-secondary transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Timeline */}
      <div className="space-y-1">
        {day.activities.map((activity, i) => (
          <div key={i} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColors[activity.type] || "bg-secondary text-muted-foreground"}`}>
                {typeIcons[activity.type] || <MapPin className="w-4 h-4" />}
              </div>
              {i < day.activities.length - 1 && (
                <div className="w-px flex-1 bg-border my-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="bg-card rounded-2xl p-4 shadow-card hover:shadow-elevated transition-shadow group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-card-foreground text-sm">
                      {activity.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </span>
                      <span className="text-xs text-muted-foreground">· {activity.duration}</span>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-secondary">
                    <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
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
    </div>
  );
}
