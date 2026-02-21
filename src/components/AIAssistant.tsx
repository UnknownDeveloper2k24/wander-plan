import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Mic, MicOff, Loader2, Shield, Brain, Wallet, Navigation } from "lucide-react";
import orangeBot from "@/assets/orange-bot.png";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

const PROXY_CAPABILITIES = [
  { icon: Brain, label: "Concierge", desc: "Personalized suggestions" },
  { icon: Navigation, label: "Negotiate", desc: "Group trip planning" },
  { icon: Shield, label: "Monitor", desc: "Real-time alerts" },
  { icon: Wallet, label: "Budget", desc: "Spending optimizer" },
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [wakeListening, setWakeListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const wakeRecognitionRef = useRef<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Traveler";

  // Wake word listener - continuously listens for "hey jinny"
  useEffect(() => {
    if (open) return; // Don't listen when chat is already open

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const startWakeListener = () => {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      wakeRecognitionRef.current = recognition;

      recognition.onstart = () => setWakeListening(true);
      recognition.onend = () => {
        setWakeListening(false);
        // Restart if chat isn't open
        if (!open) {
          setTimeout(() => {
            try { startWakeListener(); } catch {}
          }, 500);
        }
      };
      recognition.onerror = (e: any) => {
        setWakeListening(false);
        // Restart on non-fatal errors
        if (e.error !== "not-allowed" && e.error !== "service-not-allowed") {
          setTimeout(() => {
            try { startWakeListener(); } catch {}
          }, 1000);
        }
      };
      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.toLowerCase().trim();
          if (transcript.includes("hey jinny") || transcript.includes("hey jenny") || transcript.includes("hey ginny")) {
            recognition.stop();
            setOpen(true);
            toast({ title: "🧡 Jinny activated!", description: "Hey! How can I help you?" });
            break;
          }
        }
      };

      try { recognition.start(); } catch {}
    };

    startWakeListener();

    return () => {
      try { wakeRecognitionRef.current?.stop(); } catch {}
    };
  }, [open, toast]);

  // Set initial greeting when opened with user context
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: `Hey ${userName}! 👋 I'm **Jinny** — your travel companion! 🧡\n\nI can:\n- 🧠 Give personalized suggestions based on your travel history\n- 🤝 Negotiate itineraries in group trips for you\n- 🛡️ Monitor disruptions and alert you proactively\n- 💰 Optimize your budget and track spending\n\nWhat would you like to do?`,
        },
      ]);
    }
  }, [open, messages.length, userName]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleAction = useCallback(async (content: string) => {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
    if (!jsonMatch) return;
    try {
      const action = JSON.parse(jsonMatch[1]);

      if (action.action === "create_trip" && user) {
        const today = new Date();
        const start = today.toISOString().split("T")[0];
        const end = new Date(today.getTime() + (action.days || 3) * 86400000).toISOString().split("T")[0];

        const { error: insertError } = await supabase.from("trips").insert({
          name: action.name || `Trip to ${action.destination}`,
          destination: action.destination,
          country: action.country || "India",
          start_date: start,
          end_date: end,
          budget_total: action.budget || 0,
          organizer_id: user.id,
        });
        if (insertError) throw insertError;

        queryClient.invalidateQueries({ queryKey: ["trips"] });
        toast({ title: "Trip created! 🎉", description: `${action.destination} trip is ready.` });

        const { data: newTrips } = await supabase.from("trips")
          .select("id")
          .eq("organizer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);
        if (newTrips && newTrips.length > 0) {
          navigate(`/itinerary/${newTrips[0].id}`);
        }
      }

      if (action.action === "budget_alert") {
        toast({
          title: `💰 Budget Alert`,
          description: action.message || `Spent: ₹${action.spent?.toLocaleString("en-IN")} | Remaining: ₹${action.remaining?.toLocaleString("en-IN")}`,
        });
      }
    } catch (e: any) {
      console.error("Action error:", e);
    }
  }, [user, navigate, queryClient, toast]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages.map((m) => ({ role: m.role, content: m.content })) }),
      });

      if (resp.status === 429) {
        toast({ title: "Rate limited", description: "Too many requests. Please wait a moment.", variant: "destructive" });
        throw new Error("Rate limited");
      }
      if (resp.status === 402) {
        toast({ title: "Credits exhausted", description: "Please add funds to continue using AI.", variant: "destructive" });
        throw new Error("Credits exhausted");
      }
      if (!resp.ok || !resp.body) throw new Error("Failed to connect to assistant");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > allMessages.length) {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev.slice(0, allMessages.length), { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      handleAction(assistantSoFar);
    } catch (e: any) {
      if (!assistantSoFar) {
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
      }
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Not supported", description: "Speech recognition isn't available in this browser.", variant: "destructive" });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      sendMessage(transcript);
    };
    recognition.start();
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  // Dragging state
  const [pos, setPos] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number; dragging: boolean; pointerDown: boolean }>({ startX: 0, startY: 0, startPosX: 0, startPosY: 0, dragging: false, pointerDown: false });

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, startPosX: pos.x, startPosY: pos.y, dragging: false, pointerDown: true };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.pointerDown) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) d.dragging = true;
    if (d.dragging) {
      setPos({ x: Math.max(0, Math.min(window.innerWidth - 80, d.startPosX + dx)), y: Math.max(0, Math.min(window.innerHeight - 80, d.startPosY + dy)) });
    }
  };
  const onPointerUp = () => {
    if (!dragRef.current.dragging) setOpen(true);
    dragRef.current.pointerDown = false;
    dragRef.current.dragging = false;
  };

  return (
    <>
      {/* Floating draggable bot - always visible */}
      {!open && (
        <div className="fixed z-50" style={{ left: pos.x, top: pos.y }}>
          <img
            src={orangeBot}
            alt="Jinny - Your Travel Companion"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className="w-20 h-20 cursor-grab active:cursor-grabbing select-none hover:scale-110 transition-transform drop-shadow-lg animate-fade-in touch-none"
            draggable={false}
          />
          {/* Wake word indicator */}
          {wakeListening && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-card/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[9px] text-muted-foreground font-medium whitespace-nowrap">Say "Hey Jinny"</span>
            </div>
          )}
        </div>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] bg-card border border-border rounded-2xl shadow-elevated flex flex-col animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                <img src={orangeBot} alt="Jinny" className="w-8 h-8 object-cover" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-card-foreground">Jinny</h3>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                  Your travel companion • {userName}
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Capability pills - show when few messages */}
          {messages.length <= 1 && (
            <div className="flex gap-2 px-4 py-2 overflow-x-auto border-b border-border bg-background/50">
              {PROXY_CAPABILITIES.map((cap) => {
                const Icon = cap.icon;
                return (
                  <button
                    key={cap.label}
                    onClick={() => handleQuickAction(
                      cap.label === "Concierge" ? "Based on my travel history and preferences, suggest my next perfect trip." :
                      cap.label === "Negotiate" ? "Help me negotiate the itinerary for my upcoming group trip. Balance everyone's preferences." :
                      cap.label === "Monitor" ? "Check for any disruptions, weather alerts, or changes affecting my upcoming trips." :
                      "Analyze my spending across all trips and suggest where I can save money."
                    )}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-[11px] font-medium hover:bg-secondary/80 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Icon className="w-3 h-3" />
                    {cap.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-secondary-foreground rounded-bl-sm"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none [&_p]:m-0 [&_ul]:my-1 [&_li]:my-0">
                      <ReactMarkdown>{m.content.replace(/```json[\s\S]*?```/g, "✅ *Action processed*")}</ReactMarkdown>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="bg-secondary px-3 py-2 rounded-xl rounded-bl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">Jinny is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2">
              <button
                onClick={isListening ? () => { recognitionRef.current?.stop(); setIsListening(false); } : startVoice}
                className={`p-2 rounded-lg transition-colors ${
                  isListening ? "bg-destructive text-destructive-foreground animate-pulse" : "hover:bg-secondary text-muted-foreground"
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <input
                type="text"
                placeholder="Ask Jinny anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
