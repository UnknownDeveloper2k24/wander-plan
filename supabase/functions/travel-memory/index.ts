import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Authorization required');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { action } = await req.json();

    switch (action) {
      case 'learn': {
        // Fetch all user trips with activities
        const { data: trips } = await supabase
          .from('trips')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (!trips || trips.length === 0) {
          return new Response(JSON.stringify({ message: 'No trips to learn from yet' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Fetch activities for all trips via itineraries
        const tripIds = trips.map(t => t.id);
        const { data: itineraries } = await supabase
          .from('itineraries')
          .select('id, trip_id')
          .in('trip_id', tripIds);

        let allActivities: any[] = [];
        if (itineraries && itineraries.length > 0) {
          const itineraryIds = itineraries.map(i => i.id);
          const { data: activities } = await supabase
            .from('activities')
            .select('*')
            .in('itinerary_id', itineraryIds);
          allActivities = activities || [];
        }

        // Fetch current profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // Use AI to analyze patterns and build memory
        const prompt = `Analyze this traveler's history and extract a persistent memory profile.

## Trips (${trips.length}):
${trips.map(t => `- "${t.name}" to ${t.destination}, ${t.country || ''} | Budget: ₹${t.budget_total} | ${t.start_date} to ${t.end_date} | Status: ${t.status}`).join('\n')}

## Activities (${allActivities.length}):
${allActivities.slice(0, 50).map(a => `- ${a.name} | Category: ${a.category} | Cost: ₹${a.cost} | Location: ${a.location_name || 'N/A'}`).join('\n')}

## Current Profile:
${JSON.stringify(profile?.preferences || {})}
${JSON.stringify(profile?.travel_personality || {})}

Extract and return ONLY this JSON:
{
  "preferences": {
    "favorite_categories": ["food", "attraction", ...top 3 categories by frequency],
    "avg_daily_budget": number (INR),
    "preferred_pace": "relaxed" | "moderate" | "packed",
    "cuisine_preferences": ["street food", "fine dining", etc],
    "accommodation_style": "budget" | "mid-range" | "luxury",
    "transport_preference": "walking" | "public" | "taxi" | "mixed",
    "preferred_destinations": ["city names they visit most"],
    "time_preference": "early_bird" | "normal" | "night_owl",
    "group_size_preference": "solo" | "couple" | "small_group" | "large_group"
  },
  "travel_personality": {
    "type": "Explorer" | "Relaxer" | "Adventurer" | "Culture Buff" | "Foodie" | "Budget Traveler",
    "risk_tolerance": "low" | "medium" | "high",
    "planning_style": "spontaneous" | "semi-planned" | "fully_planned",
    "social_preference": "solo" | "small_groups" | "social",
    "description": "One sentence personality summary"
  },
  "travel_history": [
    { "destination": "city", "country": "country", "trips_count": 1, "total_spent": 0, "favorite_activity": "name" }
  ],
  "insights": [
    "You tend to prefer street food over fine dining",
    "Your average trip lasts 3-4 days",
    "You're a budget-conscious traveler who prioritizes experiences"
  ]
}`;

        const response = await fetch(AI_GATEWAY_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              { role: 'system', content: 'You analyze travel data and extract behavioral patterns. Respond ONLY with valid JSON.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          const t = await response.text();
          console.error('AI error:', response.status, t);
          if (response.status === 429) {
            return new Response(JSON.stringify({ error: 'Rate limited, try again later.' }), {
              status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          throw new Error('AI analysis failed');
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Failed to parse AI memory');

        const memory = JSON.parse(jsonMatch[0]);

        // Update profile with learned memory
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            preferences: memory.preferences || {},
            travel_personality: memory.travel_personality || {},
            travel_history: memory.travel_history || [],
          })
          .eq('id', user.id);

        if (updateError) throw updateError;

        return new Response(JSON.stringify({
          success: true,
          memory,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get-memory': {
        const { data: profile } = await supabase
          .from('profiles')
          .select('preferences, travel_personality, travel_history')
          .eq('id', user.id)
          .single();

        return new Response(JSON.stringify({
          preferences: profile?.preferences || {},
          travel_personality: profile?.travel_personality || {},
          travel_history: profile?.travel_history || [],
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: unknown) {
    console.error('Travel memory error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
