import { Search, MapPin, UserPlus } from "lucide-react";
import { friends } from "@/data/mockData";

const statusColors: Record<string, string> = {
  traveling: "bg-success",
  planning: "bg-warning",
  online: "bg-accent",
  offline: "bg-muted-foreground/30",
};

const statusLabels: Record<string, string> = {
  traveling: "Traveling",
  planning: "Planning",
  online: "Online",
  offline: "Offline",
};

export default function Friends() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Friends</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect and travel together
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Find friends..."
              className="pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm w-56 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-card"
            />
          </div>
          <button className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add Friend
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {friends.map((friend, i) => (
          <div
            key={friend.id}
            className="bg-card rounded-2xl p-5 shadow-card hover:shadow-elevated transition-all cursor-pointer group animate-fade-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-2xl">
                  {friend.avatar}
                </div>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card ${statusColors[friend.status]}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-card-foreground">{friend.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{friend.location}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-primary-foreground ${statusColors[friend.status]}`}
                  >
                    {statusLabels[friend.status]}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-sm font-bold text-card-foreground">{friend.trips}</p>
                <p className="text-[10px] text-muted-foreground">Trips</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-card-foreground">{friend.mutual}</p>
                <p className="text-[10px] text-muted-foreground">Mutual</p>
              </div>
              <button className="px-4 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
