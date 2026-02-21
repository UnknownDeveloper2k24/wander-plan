import { useState } from "react";
import { Link as LinkIcon, UserPlus, Users as UsersIcon, Copy, Check, X, Loader2, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTrips } from "@/hooks/useTrips";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function Friends() {
  const { user } = useAuth();
  const { data: trips = [] } = useTrips();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Get all trip members
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

  // Get invite links created by user
  const { data: invites = [] } = useQuery({
    queryKey: ["trip-invites", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trip_invites")
        .select("*, trips(name, destination)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Get pending join requests for organizer's trips
  const { data: joinRequests = [] } = useQuery({
    queryKey: ["join-requests", user?.id],
    queryFn: async () => {
      const orgTrips = trips.filter(t => t.organizer_id === user?.id);
      if (orgTrips.length === 0) return [];
      const { data, error } = await supabase
        .from("trip_join_requests")
        .select("*, trips(name, destination), profiles:user_id(name, avatar_url)")
        .in("trip_id", orgTrips.map(t => t.id))
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: trips.length > 0 && !!user,
  });

  // Get user's own pending requests
  const { data: myRequests = [] } = useQuery({
    queryKey: ["my-join-requests", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trip_join_requests")
        .select("*, trips(name, destination)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const uniqueFriends = Array.from(
    new Map(
      members
        .filter(m => m.user_id !== user?.id)
        .map(m => [m.user_id, m])
    ).values()
  );

  const handleGenerateInvite = async () => {
    if (!selectedTripId) {
      toast({ title: "Select a trip", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const { error } = await supabase
        .from("trip_invites")
        .insert({ trip_id: selectedTripId, created_by: user!.id });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["trip-invites"] });
      toast({ title: "Invite link created! 🔗" });
      setShowInvite(false);
      setSelectedTripId("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const copyInviteLink = (code: string) => {
    const url = `${window.location.origin}/join/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({ title: "Link copied! 📋" });
  };

  const handleRequest = async (requestId: string, action: "accepted" | "rejected", tripId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from("trip_join_requests")
        .update({ status: action, resolved_at: new Date().toISOString() })
        .eq("id", requestId);
      if (error) throw error;

      if (action === "accepted") {
        const { error: memErr } = await supabase
          .from("trip_memberships")
          .insert({ trip_id: tripId, user_id: userId, role: "member" });
        if (memErr && !memErr.message.includes("duplicate")) throw memErr;
      }

      queryClient.invalidateQueries({ queryKey: ["join-requests"] });
      queryClient.invalidateQueries({ queryKey: ["trip-members"] });
      toast({ title: action === "accepted" ? "Member added! ✅" : "Request rejected" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Travel Friends</h1>
          <p className="text-sm text-muted-foreground mt-1">Invite friends & manage join requests</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 flex items-center gap-2"
        >
          <LinkIcon className="w-4 h-4" />
          Generate Invite Link
        </button>
      </div>

      {/* Generate Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => setShowInvite(false)}>
          <div className="bg-card rounded-2xl max-w-md w-full p-6 shadow-elevated animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-card-foreground">Generate Invite Link</h3>
              <button onClick={() => setShowInvite(false)} className="p-1 rounded-lg hover:bg-secondary">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Select a trip</label>
                <select
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Choose a trip...</option>
                  {trips.filter(t => t.organizer_id === user?.id).map(t => (
                    <option key={t.id} value={t.id}>{t.name} — {t.destination}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-muted-foreground">
                A unique link will be generated. Share it with friends — they can sign up and request to join your trip.
              </p>
              <button
                onClick={handleGenerateInvite}
                disabled={generating || !selectedTripId}
                className="w-full px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                Generate Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Join Requests (for organizers) */}
      {joinRequests.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Pending Join Requests ({joinRequests.length})
          </h2>
          <div className="space-y-2">
            {joinRequests.map((req: any) => (
              <div key={req.id} className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-card-foreground">
                    {(req as any).profiles?.name || "Unknown User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    wants to join <span className="font-medium">{(req as any).trips?.name}</span> — {(req as any).trips?.destination}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequest(req.id, "accepted", req.trip_id, req.user_id)}
                    className="p-2 rounded-xl bg-success/10 text-success hover:bg-success/20 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleRequest(req.id, "rejected", req.trip_id, req.user_id)}
                    className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Requests */}
      {myRequests.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">My Join Requests</h2>
          <div className="space-y-2">
            {myRequests.map((req: any) => (
              <div key={req.id} className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  req.status === "accepted" ? "bg-success/10" : req.status === "rejected" ? "bg-destructive/10" : "bg-warning/10"
                }`}>
                  {req.status === "accepted" ? <CheckCircle className="w-4 h-4 text-success" /> :
                   req.status === "rejected" ? <XCircle className="w-4 h-4 text-destructive" /> :
                   <Clock className="w-4 h-4 text-warning" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-card-foreground">
                    <span className="font-medium">{(req as any).trips?.name}</span> — {(req as any).trips?.destination}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{req.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Invite Links */}
      {invites.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your Invite Links</h2>
          <div className="space-y-2">
            {invites.map((inv: any) => (
              <div key={inv.id} className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-card-foreground truncate">
                    {(inv as any).trips?.name} — {(inv as any).trips?.destination}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {window.location.origin}/join/{inv.invite_code}
                  </p>
                </div>
                <button
                  onClick={() => copyInviteLink(inv.invite_code)}
                  className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  {copiedCode === inv.invite_code ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Travel Friends</h2>
      {uniqueFriends.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uniqueFriends.map((friend: any) => (
            <div key={friend.user_id} className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                {(friend.profiles?.name || "?")[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-card-foreground text-sm">{friend.profiles?.name || "Unknown"}</p>
                <p className="text-xs text-muted-foreground capitalize">{friend.role}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground">No travel friends yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Generate an invite link and share it with friends!</p>
        </div>
      )}
    </div>
  );
}
