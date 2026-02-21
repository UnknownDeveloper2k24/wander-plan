import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, MapPin, Clock, Utensils, Camera, ShoppingBag, Bus,
  MessageSquare, Edit, IndianRupee, Loader2, Brain, AlertTriangle, Send, RefreshCw, Zap
} from "lucide-react";
import { useTrip, useItineraries, useActivities } from "@/hooks/useTrips";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

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
  const { user } = useAuth();
  const { data: trip } = useTrip(tripId);
  const { data: itineraries = [] } = useItineraries(tripId);
  const activeItinerary = itineraries[0];
  const { data: activities = [] } = useActivities(activeItinerary?.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [generating, setGenerating] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [replanning, setReplanning] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load messages for chat
  useEffect(() => {
    if (!tripId || !showChat) return;
    const loadMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    };
    loadMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`trip-chat-${tripId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `trip_id=eq.${tripId}` },
        (payload) => setMessages((prev) => [...prev, payload.new])
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tripId, showChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // AI Itinerary Generation
  const handleGenerateItinerary = async () => {
    if (!trip || !user) return;
    setGenerating(true);
    try {
      const days = Math.max(1, Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / 86400000));

      const res = await supabase.functions.invoke("ai-planner", {
        body: {
          action: "plan-itinerary",
          destination: trip.destination,
          days,
          travelers: 2,
          budget: Number(trip.budget_total) || 30000,
          interests: ["culture", "food", "sightseeing"],
          tripType: "leisure",
        },
      });
      if (res.error) throw new Error(res.error.message);
      const plan = res.data;

      // Create itinerary record
      let itineraryId = activeItinerary?.id;
      if (!itineraryId) {
        const { data: newIt, error: itErr } = await supabase
          .from("itineraries")
          .insert({ trip_id: tripId!, created_by: user.id, version: 1 })
          .select()
          .single();
        if (itErr) throw itErr;
        itineraryId = newIt.id;
      }

      // Delete old activities if re-generating
      await supabase.from("activities").delete().eq("itinerary_id", itineraryId);

      // Insert new activities
      const activitiesToInsert = (plan.activities || []).map((a: any) => ({
        itinerary_id: itineraryId,
        name: a.name,
        description: a.description,
        location_name: a.location_name,
        location_lat: a.location_lat,
        location_lng: a.location_lng,
        start_time: a.start_time,
        end_time: a.end_time,
        category: a.category,
        cost: a.cost,
        estimated_steps: a.estimated_steps,
        review_score: a.review_score,
        priority: a.priority,
        notes: a.notes,
      }));

      if (activitiesToInsert.length > 0) {
        const { error: actErr } = await supabase.from("activities").insert(activitiesToInsert);
        if (actErr) throw actErr;
      }

      // Update itinerary with cost breakdown and regret score
      await supabase.from("itineraries").update({
        cost_breakdown: { total: plan.total_cost },
        regret_score: 0.15,
      }).eq("id", itineraryId);

      queryClient.invalidateQueries({ queryKey: ["itineraries", tripId] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });

      toast({ title: "Itinerary generated! ✨", description: plan.explanation || `${activitiesToInsert.length} activities planned.` });
    } catch (error: any) {
      toast({ title: "Generation failed", description: error.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  // Send chat message
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !user || !tripId) return;
    setSendingMsg(true);
    try {
      const { error } = await supabase.from("messages").insert({
        trip_id: tripId,
        sender_id: user.id,
        content: chatInput,
        message_type: "text",
      });
      if (error) throw error;
      setChatInput("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSendingMsg(false);
    }
  };

  // Dynamic Replanning (simulate disruption)
  const handleReplan = async () => {
    if (!trip || !activeItinerary) return;
    setReplanning(true);
    try {
      // Log disruption event
      await supabase.from("disruption_events").insert({
        trip_id: tripId!,
        event_type: "weather_change",
        description: "Heavy rainfall expected — replanning outdoor activities",
        severity: "medium",
      });

      // Regenerate itinerary
      await handleGenerateItinerary();

      // Mark disruption as resolved
      toast({
        title: "Replanned! 🔄",
        description: "Itinerary updated due to weather disruption. Outdoor activities adjusted.",
      });
    } catch (error: any) {
      toast({ title: "Replan failed", description: error.message, variant: "destructive" });
    } finally {
      setReplanning(false);
    }
  };

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
    <div className="flex h-screen overflow-hidden">
      {/* Main content */}
      <div className={`flex-1 p-6 overflow-y-auto ${showChat ? "max-w-[calc(100%-360px)]" : ""}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{trip.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {trip.destination} · Budget: ₹{Number(trip.budget_total).toLocaleString("en-IN")} · {trip.status}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowChat(!showChat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-card flex items-center gap-2 ${
                showChat ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={handleReplan}
              disabled={replanning || !activeItinerary}
              className="px-4 py-2 rounded-xl bg-card border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors shadow-card flex items-center gap-2 disabled:opacity-50"
            >
              {replanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
              Replan
            </button>
            <button
              onClick={handleGenerateItinerary}
              disabled={generating}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shadow-card flex items-center gap-2 disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              {activities.length > 0 ? "Regenerate" : "Generate AI Plan"}
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
          {activeItinerary?.regret_score != null && (
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Regret Score:</span>
                <span className="text-sm font-bold text-primary">{activeItinerary.regret_score.toFixed(2)}</span>
              </div>
              {activeItinerary.cost_breakdown && (
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-success" />
                  <span className="text-xs text-muted-foreground">Est. Cost:</span>
                  <span className="text-sm font-bold text-success">₹{Number((activeItinerary.cost_breakdown as any)?.total || 0).toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {activities.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center shadow-card">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-card-foreground">No activities yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Click "Generate AI Plan" to create a regret-minimized itinerary powered by AI.
            </p>
            <button
              onClick={handleGenerateItinerary}
              disabled={generating}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              {generating ? "Generating..." : "Generate AI Plan"}
            </button>
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
                          {activity.description && (
                            <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {new Date(activity.start_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {activity.location_name && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {activity.location_name}
                              </span>
                            )}
                            {activity.cost != null && Number(activity.cost) > 0 && (
                              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                                <IndianRupee className="w-3 h-3" />
                                {Number(activity.cost).toLocaleString("en-IN")}
                              </span>
                            )}
                            {activity.review_score && (
                              <span className="text-xs text-warning font-semibold">★ {activity.review_score}</span>
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

      {/* Chat Panel */}
      {showChat && (
        <div className="w-[360px] shrink-0 border-l border-border flex flex-col bg-card animate-fade-in">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-card-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Trip Chat
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Real-time group collaboration</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No messages yet. Start the conversation!</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                    msg.sender_id === user?.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}>
                    {msg.content}
                    <p className="text-[10px] opacity-60 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={handleSendMessage}
                disabled={sendingMsg || !chatInput.trim()}
                className="p-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
