import { Search, MapPin, UserPlus, Users as UsersIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Friends() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Travel Friends</h1>
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
            Invite Friend
          </button>
        </div>
      </div>

      {/* Empty state - friends will come from trip memberships */}
      <div className="text-center py-20">
        <UsersIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-foreground text-lg">No travel friends yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          Create a trip and invite friends to collaborate! Trip members will show up here.
        </p>
        <p className="text-xs text-muted-foreground mt-4">
          Logged in as {user?.email}
        </p>
      </div>
    </div>
  );
}
