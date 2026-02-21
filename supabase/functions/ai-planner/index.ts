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

    const { action, ...params } = await req.json();

    // Load user memory if auth header present
    let memoryContext = '';
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('preferences, travel_personality, travel_history').eq('id', user.id).single();
          if (profile) {
            const prefs = profile.preferences as Record<string, any> || {};
            const personality = profile.travel_personality as Record<string, any> || {};
            const history = profile.travel_history as any[] || [];
            if (Object.keys(prefs).length > 0 || Object.keys(personality).length > 0) {
              memoryContext = `\n\n## TRAVELER MEMORY (Use this to personalize the plan):\n`;
              if (personality.type) memoryContext += `- Personality: ${personality.type} (${personality.description || ''})\n`;
              if (prefs.preferred_pace) memoryContext += `- Preferred pace: ${prefs.preferred_pace}\n`;
              if (prefs.favorite_categories?.length) memoryContext += `- Favorite activities: ${prefs.favorite_categories.join(', ')}\n`;
              if (prefs.cuisine_preferences?.length) memoryContext += `- Cuisine preferences: ${prefs.cuisine_preferences.join(', ')}\n`;
              if (prefs.accommodation_style) memoryContext += `- Accommodation: ${prefs.accommodation_style}\n`;
              if (prefs.transport_preference) memoryContext += `- Transport: ${prefs.transport_preference}\n`;
              if (prefs.time_preference) memoryContext += `- Time preference: ${prefs.time_preference}\n`;
              if (prefs.avg_daily_budget) memoryContext += `- Avg daily budget: ₹${prefs.avg_daily_budget}\n`;
              if (history.length > 0) memoryContext += `- Past destinations: ${history.map((h: any) => h.destination || h).join(', ')}\n`;
              memoryContext += `\nIMPORTANT: Tailor activities, restaurants, pace, and budget allocation based on this traveler's known preferences. Suggest NEW destinations they haven't visited. Match their pace and style.\n`;
            }
          }
        }
      } catch (e) { console.error('Memory load error:', e); }
    }

    switch (action) {
      case 'plan-itinerary': {
        const { destination, days, travelers, budget, interests, tripType } = params;

        const prompt = `You are an expert Indian travel planner. Create a detailed ${days}-day itinerary for ${travelers} travelers going to ${destination}, India.${memoryContext}

Budget: ₹${budget} INR total
Trip type: ${tripType || 'leisure'}
Interests: ${interests?.join(', ') || 'general sightseeing'}

Generate a JSON response with the following structure:
{
  "activities": [
    {
      "name": "Activity name",
      "description": "Brief description",
      "location_name": "Location",
      "location_lat": 0.0,
      "location_lng": 0.0,
      "start_time": "2025-01-01T08:00:00+05:30",
      "end_time": "2025-01-01T09:30:00+05:30",
      "category": "food|attraction|transport|shopping|accommodation|other",
      "cost": 500,
      "estimated_steps": 2000,
      "review_score": 4.5,
      "priority": 0.8,
      "notes": "Helpful tip"
    }
  ],
  "total_cost": 15000,
  "explanation": "Why this itinerary was chosen"
}

All costs must be in INR (₹). Include realistic Indian destinations, restaurants, and activities. Make activities varied across the day with proper time gaps.`;

        const response = await fetch(AI_GATEWAY_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              { role: 'system', content: 'You are an expert travel planner specializing in Indian destinations. Always respond with valid JSON only.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(`AI Gateway error [${response.status}]: ${JSON.stringify(data)}`);
        }

        const content = data.choices?.[0]?.message?.content || '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Failed to parse response' };

        return new Response(JSON.stringify(parsed), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'regret-counterfactual': {
        const { destination, days, travelers, budget, interests, tripType } = params;

        const prompt = `You are an expert travel planner specializing in regret-aware counterfactual planning. Generate 3 ALTERNATIVE itinerary plans for ${travelers} travelers visiting ${destination} for ${days} days.${memoryContext}

Budget: ₹${budget} INR total
Trip type: ${tripType || 'leisure'}
Interests: ${interests?.join(', ') || 'general sightseeing'}

Generate EXACTLY 3 plans with different strategies:

1. **Budget Focused** — Minimize cost while still having a good trip. Use budget hotels, street food, free attractions. Stay well under budget.
2. **Balanced** — Best value for money. Mix of paid and free activities, mid-range dining, popular attractions. Optimal time management.
3. **Experience Focused** — Maximize unique experiences regardless of cost (but stay within budget). Premium restaurants, exclusive tours, unique local experiences.

For EACH plan, you must calculate these risk metrics (0-100 scale):
- fatigue_level: Physical exhaustion risk. More activities, walking, early starts = higher fatigue. Budget plans with more walking = moderate. Experience plans with packed schedules = high.
- budget_overrun_risk: Probability of exceeding budget. Budget plans = low (10-25). Balanced = moderate (30-50). Experience = high (50-80).
- experience_quality: Overall quality of experiences. Budget = moderate (40-60). Balanced = good (60-75). Experience = excellent (80-95).

Return this exact JSON structure:
{
  "plans": [
    {
      "variant": "budget",
      "label": "Budget Focused",
      "tagline": "Maximum savings, smart choices",
      "total_cost": 12000,
      "fatigue_level": 55,
      "budget_overrun_risk": 15,
      "experience_quality": 50,
      "regret_score": 0.35,
      "activities": [
        {
          "name": "Activity name",
          "description": "Brief description",
          "location_name": "Location",
          "start_time": "2025-01-01T08:00:00+05:30",
          "end_time": "2025-01-01T09:30:00+05:30",
          "category": "food|attraction|transport|shopping",
          "cost": 200,
          "estimated_steps": 3000,
          "review_score": 4.2,
          "priority": 0.7,
          "notes": "Tip"
        }
      ],
      "daily_summary": ["Day 1: ...", "Day 2: ..."],
      "pros": ["Cheap", "Authentic"],
      "cons": ["Fewer premium experiences"]
    },
    {
      "variant": "balanced",
      "label": "Balanced",
      ...same structure...
    },
    {
      "variant": "experience",
      "label": "Experience Focused",
      ...same structure...
    }
  ],
  "recommendation": "balanced",
  "comparison_note": "Brief explanation of trade-offs between the 3 plans"
}

IMPORTANT:
- All costs in INR (₹)
- Activities should have realistic Indian locations with approximate lat/lng
- Each plan should have ${days * 4}-${days * 6} activities spread across all days
- The regret_score should be 0.0-1.0 where lower = less regret (budget plans have higher regret on experience, experience plans have higher regret on budget)
- Make start_time/end_time use the proper date range starting from tomorrow`;

        const response = await fetch(AI_GATEWAY_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              { role: 'system', content: 'You are an expert travel planner. Always respond with valid JSON only. No markdown, no explanation, just JSON.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.8,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(`AI Gateway error [${response.status}]: ${JSON.stringify(data)}`);
        }

        const content = data.choices?.[0]?.message?.content || '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Failed to parse response' };

        return new Response(JSON.stringify(parsed), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'extract-intent': {
        const { transcript } = params;
        
        const response = await fetch(AI_GATEWAY_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              { role: 'system', content: 'Extract structured travel intent from user input. Respond ONLY with valid JSON.' },
              { role: 'user', content: `Extract travel intent from: "${transcript}"\n\nReturn JSON: { "destination": string|null, "start_date": string|null, "duration_days": number|null, "travelers_count": number|null, "budget_range": {"min": number, "max": number}|null, "interests": string[], "trip_type": "solo"|"couple"|"friends"|"family"|null, "confidence": 0.0-1.0 }` },
            ],
            temperature: 0,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(`AI error [${response.status}]: ${JSON.stringify(data)}`);

        const content = data.choices?.[0]?.message?.content || '{}';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

        return new Response(JSON.stringify(parsed), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: unknown) {
    console.error('AI Planner error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
