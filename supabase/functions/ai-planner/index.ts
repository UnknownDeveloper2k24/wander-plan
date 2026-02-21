import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    switch (action) {
      case 'plan-itinerary': {
        const { destination, days, travelers, budget, interests, tripType } = params;

        const prompt = `You are an expert Indian travel planner. Create a detailed ${days}-day itinerary for ${travelers} travelers going to ${destination}, India.

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
        // Extract JSON from response
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
