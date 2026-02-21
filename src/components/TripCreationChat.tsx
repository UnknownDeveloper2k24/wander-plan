import { useState, useRef, useEffect } from "react";
import { Loader2, Send, Mic, MicOff, Plane, Train, Bus, Ship, MapPin, Calendar, Wallet, Users, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getCurrencySymbol } from "@/lib/currency";
import ReactMarkdown from "react-markdown";

type Step = "destination" | "dates" | "budget" | "travelers" | "transport" | "confirm";
type Msg = { role: "bot" | "user"; content: string; options?: Option[] };
type Option = { label: string; value: string; icon?: any };

const TRANSPORT_OPTIONS: Option[] = [
  { label: "Flight ✈️", value: "flight", icon: Plane },
  { label: "Train 🚆", value: "train", icon: Train },
  { label: "Bus 🚌", value: "bus", icon: Bus },
  { label: "Ship 🚢", value: "ship", icon: Ship },
];

const TRIP_TYPE_OPTIONS: Option[] = [
  { label: "Solo", value: "solo", icon: Users },
  { label: "Couple", value: "couple", icon: Users },
  { label: "Friends", value: "friends", icon: Users },
  { label: "Family", value: "family", icon: Users },
];

function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(start: string, end: string): number {
  const s = parseLocalDate(start);
  const e = parseLocalDate(end);
  return Math.round((e.getTime() - s.getTime()) / 86400000);
}

interface Props {
  onClose: () => void;
  tripType: string;
}

export default function TripCreationChat({ onClose, tripType }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("destination");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);

  // Collected trip data
  const [tripData, setTripData] = useState({
    destination: "",
    country: "",
    start_date: "",
    end_date: "",
    budget: "",
    travelers: "1",
    transport: "",
    name: "",
  });

  // AI suggestion loading
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Start conversation
  useEffect(() => {
    const typeLabel = tripType === "solo" ? "solo" : tripType === "group" ? "group" : "random traveler";
    addBotMessage(`Hey! Let's plan your **${typeLabel} trip** step by step! 🗺️\n\n**Where do you want to go?** Tell me the city and country.`, []);
  }, []); // eslint-disable-line

  const addBotMessage = (content: string, options?: Option[]) => {
    setMessages((prev) => [...prev, { role: "bot", content, options }]);
  };

  const addUserMessage = (content: string) => {
    setMessages((prev) => [...prev, { role: "user", content }]);
  };

  const handleInput = (text: string) => {
    if (!text.trim()) return;
    addUserMessage(text);
    setInput("");
    processStep(text.trim());
  };

  const handleOptionClick = (option: Option) => {
    addUserMessage(option.label);
    processStep(option.value);
  };

  const processStep = async (value: string) => {
    switch (step) {
      case "destination": {
        // Parse destination - try to extract city and country
        const parts = value.split(",").map((s) => s.trim());
        const dest = parts[0] || value;
        const country = parts[1] || "";
        setTripData((prev) => ({ ...prev, destination: dest, country }));

        // Get AI suggestion for best time to visit
        setAiLoading(true);
        try {
          const res = await supabase.functions.invoke("ai-planner", {
            body: {
              action: "extract-intent",
              transcript: `Best time to visit ${dest} ${country}, typical budget per day, and best transport options`,
            },
          });
          const suggestion = res.data;
          const budgetHint = suggestion?.budget_range?.max
            ? `Average daily budget: ~${getCurrencySymbol(country)}${Math.round(suggestion.budget_range.max / (suggestion.duration_days || 5)).toLocaleString()}`
            : "";

          addBotMessage(
            `Great choice! **${dest}${country ? `, ${country}` : ""}** 🎉\n\n${budgetHint ? `💡 ${budgetHint}\n\n` : ""}**When do you want to travel?** Enter your start and end dates (e.g., "2025-03-15 to 2025-03-20") or just say how many days.`
          );
        } catch {
          addBotMessage(
            `**${dest}${country ? `, ${country}` : ""}** sounds amazing! 🎉\n\n**When do you want to travel?** Enter dates like "2025-03-15 to 2025-03-20" or say "5 days from March 15".`
          );
        } finally {
          setAiLoading(false);
        }
        setStep("dates");
        break;
      }

      case "dates": {
        // Parse dates - handle various formats
        let startDate = "";
        let endDate = "";

        // Try "YYYY-MM-DD to YYYY-MM-DD"
        const rangeMatch = value.match(/(\d{4}-\d{2}-\d{2})\s*(?:to|[-–])\s*(\d{4}-\d{2}-\d{2})/);
        if (rangeMatch) {
          startDate = rangeMatch[1];
          endDate = rangeMatch[2];
        } else {
          // Try "N days from YYYY-MM-DD" or just "N days"
          const daysMatch = value.match(/(\d+)\s*days?/i);
          const fromMatch = value.match(/from\s*(\d{4}-\d{2}-\d{2})/i);
          if (daysMatch) {
            const days = parseInt(daysMatch[1]);
            const start = fromMatch ? parseLocalDate(fromMatch[1]) : new Date();
            if (start < new Date()) {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              startDate = formatLocalDate(tomorrow);
            } else {
              startDate = formatLocalDate(start);
            }
            const end = parseLocalDate(startDate);
            end.setDate(end.getDate() + days);
            endDate = formatLocalDate(end);
          } else {
            // Try single date
            const singleDate = value.match(/(\d{4}-\d{2}-\d{2})/);
            if (singleDate) {
              startDate = singleDate[1];
              const end = parseLocalDate(startDate);
              end.setDate(end.getDate() + 3);
              endDate = formatLocalDate(end);
            }
          }
        }

        if (!startDate || !endDate) {
          addBotMessage("I couldn't understand those dates. Please try:\n- `2025-03-15 to 2025-03-20`\n- `5 days from 2025-03-15`\n- `7 days`");
          return;
        }

        const days = daysBetween(startDate, endDate);
        if (days <= 0) {
          addBotMessage("End date must be after start date. Please try again.");
          return;
        }

        setTripData((prev) => ({ ...prev, start_date: startDate, end_date: endDate }));
        const startFormatted = parseLocalDate(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const endFormatted = parseLocalDate(endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

        addBotMessage(
          `📅 **${startFormatted} → ${endFormatted}** (${days} day${days > 1 ? "s" : ""})\n\n**What's your total budget?** Enter an amount (e.g., "50000" or "2000 USD").`
        );
        setStep("budget");
        break;
      }

      case "budget": {
        const numMatch = value.match(/[\d,]+/);
        const budget = numMatch ? numMatch[0].replace(/,/g, "") : "0";
        setTripData((prev) => ({ ...prev, budget }));

        const symbol = getCurrencySymbol(tripData.country);
        const days = daysBetween(tripData.start_date, tripData.end_date);
        const perDay = Math.round(Number(budget) / days);

        addBotMessage(
          `💰 Budget: **${symbol}${Number(budget).toLocaleString()}** (${symbol}${perDay.toLocaleString()}/day)\n\n**How many travelers?**`,
          TRIP_TYPE_OPTIONS
        );
        setStep("travelers");
        break;
      }

      case "travelers": {
        const travelersMatch = value.match(/\d+/);
        const travelers = travelersMatch ? travelersMatch[0] : value === "solo" ? "1" : value === "couple" ? "2" : "1";
        setTripData((prev) => ({ ...prev, travelers }));

        addBotMessage(
          `👥 **${travelers} traveler${Number(travelers) > 1 ? "s" : ""}**\n\n**How do you want to get there?** Pick your preferred transport:`,
          TRANSPORT_OPTIONS
        );
        setStep("transport");
        break;
      }

      case "transport": {
        setTripData((prev) => ({ ...prev, transport: value }));
        const transportLabel = TRANSPORT_OPTIONS.find((t) => t.value === value)?.label || value;

        // Generate trip name
        const name = `${tripType === "solo" ? "Solo" : tripType === "group" ? "Group" : "Random"} trip to ${tripData.destination}`;
        setTripData((prev) => ({ ...prev, name }));

        const days = daysBetween(tripData.start_date, tripData.end_date);
        const symbol = getCurrencySymbol(tripData.country);
        const startF = parseLocalDate(tripData.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const endF = parseLocalDate(tripData.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

        addBotMessage(
          `Here's your trip summary:\n\n` +
          `📍 **${tripData.destination}${tripData.country ? `, ${tripData.country}` : ""}**\n` +
          `📅 **${startF} → ${endF}** (${days} days)\n` +
          `💰 **${symbol}${Number(tripData.budget).toLocaleString()}** budget\n` +
          `👥 **${tripData.travelers} traveler${Number(tripData.travelers) > 1 ? "s" : ""}**\n` +
          `🚀 **${transportLabel}**\n\n` +
          `Ready to create this trip? Type **"yes"** or **"create"**.`,
          [
            { label: "✅ Create Trip", value: "confirm" },
            { label: "❌ Cancel", value: "cancel" },
          ]
        );
        setStep("confirm");
        break;
      }

      case "confirm": {
        if (value === "cancel" || value.toLowerCase().includes("cancel") || value.toLowerCase().includes("no")) {
          onClose();
          return;
        }

        setCreating(true);
        try {
          const { error } = await supabase.from("trips").insert({
            name: tripData.name || `Trip to ${tripData.destination}`,
            destination: tripData.destination,
            country: tripData.country || null,
            start_date: tripData.start_date,
            end_date: tripData.end_date,
            budget_total: Number(tripData.budget) || 0,
            organizer_id: user!.id,
          });
          if (error) throw error;

          addBotMessage("🎉 **Trip created successfully!** Redirecting to your itinerary...");
          queryClient.invalidateQueries({ queryKey: ["trips"] });
          toast({ title: "Trip created!", description: `${tripData.destination} trip is ready.` });

          const { data: newTrips } = await supabase
            .from("trips")
            .select("id")
            .eq("organizer_id", user!.id)
            .order("created_at", { ascending: false })
            .limit(1);

          setTimeout(() => {
            if (newTrips?.[0]) navigate(`/itinerary/${newTrips[0].id}`);
            onClose();
          }, 1500);
        } catch (error: any) {
          addBotMessage(`❌ Error: ${error.message}. Please try again.`);
          toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
          setCreating(false);
        }
        break;
      }
    }
  };

  // Voice input with continuous listening
  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast({ title: "Not supported", variant: "destructive" });
      return;
    }
    if (isListeningRef.current) {
      isListeningRef.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    recognitionRef.current = rec;
    isListeningRef.current = true;

    let finalT = "";
    rec.onstart = () => setIsListening(true);
    rec.onend = () => {
      if (isListeningRef.current) {
        try { rec.start(); } catch {}
      } else {
        setIsListening(false);
        if (finalT.trim()) {
          handleInput(finalT.trim());
          finalT = "";
        }
      }
    };
    rec.onerror = (e: any) => {
      if (e.error === "not-allowed") {
        isListeningRef.current = false;
        setIsListening(false);
      }
    };
    rec.onresult = (event: any) => {
      finalT = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalT += event.results[i][0].transcript + " ";
        else interim += event.results[i][0].transcript;
      }
      setInput(interim || finalT.trim());
    };
    rec.start();
  };

  const stepIcons: Record<Step, any> = {
    destination: MapPin,
    dates: Calendar,
    budget: Wallet,
    travelers: Users,
    transport: Plane,
    confirm: CheckCircle2,
  };

  const steps: Step[] = ["destination", "dates", "budget", "travelers", "transport", "confirm"];
  const currentIdx = steps.indexOf(step);

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden animate-fade-in border border-border">
      {/* Progress bar */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-card-foreground text-sm">Plan Your Trip</h3>
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
        </div>
        <div className="flex items-center gap-1">
          {steps.map((s, i) => {
            const Icon = stepIcons[s];
            return (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-colors ${
                  i <= currentIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <Icon className="w-3 h-3" />
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded transition-colors ${i < currentIdx ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat messages */}
      <div ref={scrollRef} className="h-[300px] overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i}>
            <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-secondary text-secondary-foreground rounded-bl-sm"
              }`}>
                {m.role === "bot" ? (
                  <div className="prose prose-sm max-w-none [&_p]:m-0 [&_ul]:my-1 [&_li]:my-0 text-secondary-foreground">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : m.content}
              </div>
            </div>
            {/* Options */}
            {m.role === "bot" && m.options && m.options.length > 0 && i === messages.length - 1 && (
              <div className="flex flex-wrap gap-2 mt-2 ml-1">
                {m.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleOptionClick(opt)}
                    className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors border border-primary/20"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {(aiLoading || creating) && (
          <div className="flex justify-start">
            <div className="bg-secondary px-3 py-2 rounded-xl rounded-bl-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">{creating ? "Creating trip..." : "Getting suggestions..."}</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={startVoice}
            className={`p-2 rounded-lg transition-colors ${
              isListening ? "bg-destructive text-destructive-foreground animate-pulse" : "hover:bg-secondary text-muted-foreground"
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <input
            type="text"
            placeholder={
              step === "destination" ? "e.g., Kathmandu, Nepal" :
              step === "dates" ? "e.g., 2025-04-10 to 2025-04-15" :
              step === "budget" ? "e.g., 50000" :
              step === "travelers" ? "e.g., 4" :
              step === "transport" ? "Pick an option above" :
              "Type yes to confirm"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInput(input)}
            disabled={creating}
            className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={() => handleInput(input)}
            disabled={!input.trim() || creating}
            className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
