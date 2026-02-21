import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { LayoutDashboard, CalendarDays, Compass, BookOpen, Users, LogOut, Plus } from "lucide-react";
import { trips } from "@/data/mockData";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Itinerary", url: "/itinerary", icon: CalendarDays, badge: "NEW" },
];

const discoverItems = [
  { title: "Explore", url: "/explore", icon: Compass },
  { title: "Guide", url: "/guide", icon: BookOpen },
  { title: "Friends", url: "/friends", icon: Users },
];

export function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (url: string) => location.pathname === url;

  return (
    <aside
      className={`flex flex-col h-screen bg-card border-r border-border transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-[260px]"
      } shrink-0`}
    >
      {/* User Profile */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg shrink-0">
            👩
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-card-foreground truncate">Cecilia Puni</p>
              <p className="text-xs text-muted-foreground">Part-time Traveler</p>
            </div>
          )}
        </div>
      </div>

      {/* New Trip Button */}
      <div className="px-3 pt-4">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          {!collapsed && <span>New Trip</span>}
        </button>
      </div>

      {/* Trips */}
      {!collapsed && (
        <div className="px-3 pt-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
            Trips
          </p>
          <div className="space-y-1">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                to={`/itinerary`}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary/60 transition-colors group"
              >
                <span className="text-lg">{trip.flag}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">
                    {trip.destination}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {trip.duration}, {trip.startDate}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* General Nav */}
      <div className="px-3 pt-5">
        {!collapsed && (
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
            General
          </p>
        )}
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.url)
                  ? "bg-secondary text-card-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-card-foreground"
              }`}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && (
                <span className="flex-1">{item.title}</span>
              )}
              {!collapsed && item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-accent text-accent-foreground rounded">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Discover Nav */}
      <div className="px-3 pt-5">
        {!collapsed && (
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
            Discover
          </p>
        )}
        <div className="space-y-1">
          {discoverItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.url)
                  ? "bg-secondary text-card-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-card-foreground"
              }`}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </div>
      </div>

      {/* Spacer + Logout */}
      <div className="mt-auto px-3 pb-4">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors w-full">
          <LogOut className="w-[18px] h-[18px]" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
