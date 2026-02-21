import { Search, Mic, Star, Heart, ExternalLink } from "lucide-react";
import { upcomingTrips, discoveries, itineraryData, friendLocations } from "@/data/mockData";
import kualaLumpurImg from "@/assets/kuala-lumpur.jpg";
import tokyoImg from "@/assets/tokyo.jpg";
import bangkokImg from "@/assets/bangkok.jpg";
import hanoiImg from "@/assets/hanoi.jpg";
import sapaImg from "@/assets/sapa.jpg";
import malaccaImg from "@/assets/malacca.jpg";

const carouselImages = [kualaLumpurImg, tokyoImg, bangkokImg, hanoiImg, sapaImg, malaccaImg];

export default function Dashboard() {
  return (
    <div className="flex gap-6 p-6 h-screen overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Good Morning, Cecil 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Plan your itinerary with us
            </p>
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

        {/* Photo Carousel */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {carouselImages.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="Travel"
              className="w-20 h-20 rounded-2xl object-cover shrink-0 shadow-card hover:scale-105 transition-transform cursor-pointer"
            />
          ))}
        </div>

        {/* Upcoming Trips */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Upcoming Trip</h2>
              <p className="text-sm text-muted-foreground">Remember your upcoming trips!</p>
            </div>
            <button className="text-sm font-medium text-accent hover:underline">Details</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {upcomingTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-shadow cursor-pointer group"
              >
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={trip.image}
                    alt={trip.destination}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {trip.status === "confirmed" && (
                    <div className="absolute top-3 right-3 flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-success" />
                      <span className="w-2 h-2 rounded-full bg-warning" />
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-semibold">
                    <span className="text-muted-foreground">{trip.startDate}</span>{" "}
                    <span className="text-foreground">{trip.daysLeft} Days</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-card-foreground text-sm">{trip.destination}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{trip.country}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Budget: </span>
                      <span className="text-sm font-bold text-card-foreground">${trip.budget}</span>
                    </div>
                    <div className="flex -space-x-2">
                      {trip.travelers.map((t, i) => (
                        <span
                          key={i}
                          className="w-6 h-6 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-xs"
                        >
                          {t.avatar}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* For Your Trip - Discoveries */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                For your <span className="text-primary">Malaysia</span> 🇲🇾 Trip
              </h2>
              <p className="text-sm text-muted-foreground">These can't be missed places</p>
            </div>
            <button className="text-sm font-medium text-accent hover:underline">Details</button>
          </div>
          <div className="space-y-4">
            {discoveries.map((place) => (
              <div
                key={place.id}
                className="flex gap-4 bg-card rounded-2xl p-3 shadow-card hover:shadow-elevated transition-shadow cursor-pointer group"
              >
                <div className="relative w-28 h-24 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    <button className="w-6 h-6 rounded-full bg-primary/90 flex items-center justify-center">
                      <Heart className="w-3 h-3 text-primary-foreground" />
                    </button>
                    <button className="w-6 h-6 rounded-full bg-warning/90 flex items-center justify-center">
                      <ExternalLink className="w-3 h-3 text-warning-foreground" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-card-foreground text-sm">{place.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {place.description}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-3 h-3 text-warning fill-warning" />
                    <span className="text-xs font-semibold text-card-foreground">
                      {place.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">({place.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-xs text-muted-foreground">Guide:</span>
                    <span className="text-xs font-medium text-card-foreground">👤 {place.guide}</span>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {place.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-secondary text-xs font-medium text-secondary-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-[340px] shrink-0 space-y-6 overflow-y-auto">
        {/* Friends Location */}
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-card-foreground">Friends Location</h3>
            <button className="text-sm font-medium text-primary hover:underline">Expand</button>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Check on your friend live location
          </p>
          {/* Simple Map Placeholder */}
          <div className="relative w-full h-48 rounded-xl bg-accent/10 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/1280px-World_map_blank_without_borders.svg.png')] bg-contain bg-center bg-no-repeat opacity-20" />
            {friendLocations.map((friend, i) => (
              <div
                key={i}
                className="absolute flex items-center gap-1 animate-fade-in"
                style={{
                  left: `${((friend.lng + 180) / 360) * 100}%`,
                  top: `${((90 - friend.lat) / 180) * 100}%`,
                }}
              >
                <div className="w-3 h-3 rounded-full bg-primary border-2 border-card shadow-sm" />
                <div className="bg-card/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm hidden group-hover:block">
                  <p className="text-[10px] font-semibold text-card-foreground whitespace-nowrap">
                    {friend.name}
                  </p>
                  <p className="text-[9px] text-muted-foreground">{friend.location}</p>
                </div>
              </div>
            ))}
            {/* Friend Labels */}
            <div className="absolute right-4 top-8 bg-card/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-soft">
              <p className="text-xs font-semibold text-card-foreground">Shelly A.</p>
              <p className="text-[10px] text-muted-foreground">Japan</p>
            </div>
            <div className="absolute left-8 bottom-12 bg-card/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-soft">
              <p className="text-xs font-semibold text-card-foreground">Edgar P.</p>
              <p className="text-[10px] text-muted-foreground">Argentina</p>
            </div>
          </div>
        </div>

        {/* Itinerary Preview */}
        <div className="bg-card rounded-2xl overflow-hidden shadow-card">
          <div className="p-5">
            <h3 className="font-semibold text-card-foreground">
              {itineraryData.tripName}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs text-muted-foreground">Traveler:</span>
              <span className="text-xs font-medium text-card-foreground">
                👤 {itineraryData.traveler}
              </span>
            </div>
          </div>
          <img
            src={itineraryData.image}
            alt={itineraryData.tripName}
            className="w-full h-40 object-cover"
          />
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-3">Details:</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="text-sm font-bold text-card-foreground">${itineraryData.budget}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Person</p>
                <p className="text-sm font-bold text-card-foreground">{itineraryData.persons}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-bold text-card-foreground">{itineraryData.duration}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
