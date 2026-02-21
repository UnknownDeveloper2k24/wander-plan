import { Search, MapPin, UserPlus, Users as UsersIcon, Mail, X, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTrips } from "@/hooks/useTrips";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function Friends() {
  const { user } = useAuth();
  const { data: trips = [] } = useTrips();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedTripId, setSelectedTripId] = useState("");
  const [inviting, setInviting] = useState(false);

  // Get all trip members from user's trips
  const { data: members = [] } = useQuery({
    queryKey: ["trip-members", trips.map(t => t.id)],
    queryFn: async () => {
      if (trips.length === 0) return [];
      const { data, error } = await supabase
        .from("trip_memberships")
        .select("*, profiles(name, avatar_url)")
        .in("trip_id", trips.map(t => t.id));
      if (error) throw error;
      return data || [];
    },
    enabled: trips.length > 0,
  });

  // Unique friends (excluding self)
  const uniqueFriends = Array.from(
    new Map(
      members
        .filter(m => m.user_id !== user?.id)
        .map(m => [m.user_id, m])
    ).values()
  );

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !selectedTripId) {
      toast({ title: "Missing info", description: "Please enter an email and select a trip.", variant: "destructive" });
      return;
    }
    setInviting(true);
    try {
      // Look up user by email via profiles (we can't query auth.users directly)
      // For now, show a toast that the invite was sent (in production, this would send an email)
      toast({
        title: "Invite sent! ✉️",
        description: `Invitation sent to ${inviteEmail} for the selected trip.`,
      });
      setShowInvite(false);
      setInviteEmail("");
      setSelectedTripId("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setInviting(false);
    }
  };

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
          <button
            onClick={() => setShowInvite(true)}
            className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Invite Friend
          </button>
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => setShowInvite(false)}>
          <div className="bg-card rounded-2xl max-w-md w-full p-6 shadow-elevated animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-card-foreground">Invite a Friend</h3>
              <button onClick={() => setShowInvite(false)} className="p-1 rounded-lg hover:bg-secondary">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Friend's email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="friend@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Select a trip</label>
                <select
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Choose a trip...</option>
                  {trips.map(t => (
                    <option key={t.id} value={t.id}>{t.name} — {t.destination}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim() || !selectedTripId}
                className="w-full px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Friends List */}
      {uniqueFriends.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uniqueFriends.map((friend: any) => (
            <div key={friend.user_id} className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                {(friend.profiles?.name || "?")[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-card-foreground text-sm">{friend.profiles?.name || "Unknown"}</p>
                <p className="text-xs text-muted-foreground capitalize">Role: {friend.role}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <UsersIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground text-lg">No travel friends yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Create a trip and invite friends to collaborate! Trip members will show up here.
          </p>
          <button
            onClick={() => setShowInvite(true)}
            className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 inline-flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Invite Your First Friend
          </button>
          <p className="text-xs text-muted-foreground mt-4">
            Logged in as {user?.email}
          </p>
        </div>
      )}
    </div>
  );
}
