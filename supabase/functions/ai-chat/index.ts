import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

const BASE_SYSTEM_PROMPT = `You are a Personal AI Proxy Agent for a traveler on Radiator Routes. You act as their intelligent travel representative — negotiating, planning, optimizing, and protecting their interests.

## Your Core Capabilities:

### 1. Auto-Negotiate Itinerary
When multiple travelers are on a group trip, you represent THIS traveler's preferences. Suggest compromises that respect their interests (food preferences, budget limits, activity types, pace).

### 2. Personal Travel Concierge
You know this traveler's history, preferences, and personality. Give personalized suggestions — not generic ones. Reference their past trips, preferred cuisines, budget habits, and travel style.

### 3. Real-Time Trip Assistant
Monitor and advise on weather changes, flight delays, local events, and safety alerts. Proactively suggest itinerary adjustments when disruptions occur.

### 4. Budget Optimizer
Track spending against budget. Suggest cost-saving swaps, alert when overspending, and recommend budget reallocation across activities.

## Behavior Rules:
- Always speak in the traveler's language (detect from their messages)
- Be proactive — don't just answer, anticipate needs
- When creating trips, respond with JSON in \`\`\`json ... \`\`\` blocks:
{
  "action": "create_trip",
  "name": "Trip name",
  "destination": "City",
  "country": "Country",
  "days": 5,
  "budget": 50000,
  "trip_type": "solo|group|random"
}
- For itinerary generation, use:
{
  "action": "generate_itinerary",
  "trip_id": "uuid",
  "activities": [{"name":"...", "time":"...", "cost": 0, "category":"..."}]
}
- For budget alerts, use:
{
  "action": "budget_alert",
  "message": "...",
  "spent": 0,
  "remaining": 0,
  "suggestions": ["..."]
}
- Use emojis sparingly. Be concise, warm, and actionable.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const authHeader = req.headers.get('Authorization');
    const { messages } = await req.json();

    // Build personalized context by loading user's profile and trips
    let personalContext = '';

    if (authHeader) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey, {
          global: { headers: { Authorization: authHeader } },
        });

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Load profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          // Load trips
          const { data: trips } = await supabase
            .from('trips')
            .select('*')
            .order('start_date', { ascending: false })
            .limit(10);

          if (profile || trips) {
            personalContext = '\n\n## Traveler Profile:\n';

            if (profile) {
              personalContext += `- Name: ${profile.name || 'Unknown'}\n`;
              if (profile.preferences && Object.keys(profile.preferences).length > 0) {
                personalContext += `- Preferences: ${JSON.stringify(profile.preferences)}\n`;
              }
              if (profile.travel_personality && Object.keys(profile.travel_personality).length > 0) {
                personalContext += `- Travel Personality: ${JSON.stringify(profile.travel_personality)}\n`;
              }
              if (profile.travel_history && Array.isArray(profile.travel_history) && profile.travel_history.length > 0) {
                personalContext += `- Travel History: ${JSON.stringify(profile.travel_history)}\n`;
              }
            }

            if (trips && trips.length > 0) {
              personalContext += `\n## Current Trips (${trips.length}):\n`;
              for (const trip of trips) {
                const budgetStr = trip.budget_total ? `₹${Number(trip.budget_total).toLocaleString('en-IN')}` : 'Not set';
                personalContext += `- "${trip.name}" → ${trip.destination}, ${trip.country || ''} | ${trip.start_date} to ${trip.end_date} | Budget: ${budgetStr} | Status: ${trip.status} | ID: ${trip.id}\n`;
              }
            }
          }
        }
      } catch (profileError) {
        console.error('Error loading profile context:', profileError);
        // Continue without profile context
      }
    }

    const fullSystemPrompt = BASE_SYSTEM_PROMPT + personalContext;

    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: fullSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Credits exhausted, please add funds.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const t = await response.text();
      console.error('AI gateway error:', response.status, t);
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error: unknown) {
    console.error('AI Chat error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
