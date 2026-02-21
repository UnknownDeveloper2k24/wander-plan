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
    const { action, trip_id, disruption } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader || `Bearer ${supabaseKey}` } },
    });

    switch (action) {
      case 'detect-disruptions': {
        // Fetch trip details
        const { data: trip, error: tripErr } = await supabase
          .from('trips')
          .select('*')
          .eq('id', trip_id)
          .single();
        if (tripErr) throw tripErr;

        // Fetch current itinerary & activities
        const { data: itineraries } = await supabase
          .from('itineraries')
          .select('*')
          .eq('trip_id', trip_id)
          .order('version', { ascending: false })
          .limit(1);

        const itinerary = itineraries?.[0];
        let activities: any[] = [];
        if (itinerary) {
          const { data: acts } = await supabase
            .from('activities')
            .select('*')
            .eq('itinerary_id', itinerary.id)
            .order('start_time', { ascending: true });
          activities = acts || [];
        }

        // Use AI to simulate disruption detection based on destination and dates
        const detectPrompt = `You are a travel disruption detection system. Analyze the following trip and detect potential real-world disruptions.

Trip: ${trip.destination}, ${trip.country || 'India'}
Dates: ${trip.start_date} to ${trip.end_date}
Current activities: ${activities.map(a => `${a.name} at ${a.location_name} (${new Date(a.start_time).toLocaleDateString()})`).join(', ') || 'None'}

Check for these disruption types:
1. **Weather**: Monsoon season, extreme heat/cold, cyclone warnings for the destination and dates
2. **Flight/Transport**: Common delay patterns for the region
3. **Venue Closures**: National holidays, maintenance days, seasonal closures
4. **Safety**: Travel advisories, local events causing crowds

Return JSON:
{
  "disruptions": [
    {
      "type": "weather|flight_delay|venue_closed|safety|transport",
      "severity": "low|medium|high|critical",
      "title": "Short title",
      "description": "What happened",
      "affected_activities": ["activity names that are affected"],
      "time_window": "When this disruption occurs",
      "confidence": 0.0-1.0
    }
  ],
  "overall_risk": "low|medium|high",
  "needs_replan": true/false
}

Be realistic. If the trip is in monsoon season, flag weather. If it's a holiday, flag closures. Return at least 1-2 disruptions for any trip.`;

        const aiResp = await fetch(AI_GATEWAY_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              { role: 'system', content: 'You are a travel disruption detection AI. Respond with valid JSON only.' },
              { role: 'user', content: detectPrompt },
            ],
            temperature: 0.4,
          }),
        });

        const aiData = await aiResp.json();
        if (!aiResp.ok) throw new Error(`AI error: ${JSON.stringify(aiData)}`);

        const content = aiData.choices?.[0]?.message?.content || '{}';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const disruptions = jsonMatch ? JSON.parse(jsonMatch[0]) : { disruptions: [], needs_replan: false };

        return new Response(JSON.stringify(disruptions), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'auto-replan': {
        // Fetch trip
        const { data: trip, error: tripErr } = await supabase
          .from('trips')
          .select('*')
          .eq('id', trip_id)
          .single();
        if (tripErr) throw tripErr;

        // Fetch current itinerary & activities
        const { data: itineraries } = await supabase
          .from('itineraries')
          .select('*')
          .eq('trip_id', trip_id)
          .order('version', { ascending: false })
          .limit(1);

        const itinerary = itineraries?.[0];
        let currentActivities: any[] = [];
        if (itinerary) {
          const { data: acts } = await supabase
            .from('activities')
            .select('*')
            .eq('itinerary_id', itinerary.id)
            .order('start_time', { ascending: true });
          currentActivities = acts || [];
        }

        const days = Math.max(1, Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / 86400000));

        const replanPrompt = `You are an expert travel replanner. A disruption has occurred during a trip and you need to create an updated itinerary.

## Disruption Details:
Type: ${disruption.type}
Severity: ${disruption.severity}
Description: ${disruption.description}
Affected Activities: ${disruption.affected_activities?.join(', ') || 'Multiple activities'}

## Trip Details:
Destination: ${trip.destination}, ${trip.country || 'India'}
Dates: ${trip.start_date} to ${trip.end_date} (${days} days)
Budget: ₹${trip.budget_total || 30000}

## Current Itinerary:
${currentActivities.map(a => `- ${a.name} | ${a.location_name} | ${new Date(a.start_time).toLocaleString()} | ₹${a.cost || 0} | Category: ${a.category}`).join('\n') || 'No activities'}

## Instructions:
1. KEEP unaffected activities as-is (same times, locations, costs)
2. REPLACE or RESCHEDULE only the affected activities
3. Find suitable indoor alternatives if weather is the issue
4. Adjust transport if there are delays
5. Maintain the overall budget
6. Add notes explaining why each change was made

Return this JSON structure:
{
  "activities": [
    {
      "name": "Activity name",
      "description": "Brief description",
      "location_name": "Location",
      "location_lat": 0.0,
      "location_lng": 0.0,
      "start_time": "ISO timestamp with timezone",
      "end_time": "ISO timestamp with timezone",
      "category": "food|attraction|transport|shopping",
      "cost": 500,
      "estimated_steps": 2000,
      "review_score": 4.5,
      "priority": 0.8,
      "notes": "Why this activity (mention if it's a replacement)",
      "is_changed": true
    }
  ],
  "total_cost": 15000,
  "changes_summary": "Brief summary of what changed and why",
  "changes_count": 3
}`;

        const aiResp = await fetch(AI_GATEWAY_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              { role: 'system', content: 'You are an expert travel replanner. Respond with valid JSON only.' },
              { role: 'user', content: replanPrompt },
            ],
            temperature: 0.5,
          }),
        });

        const aiData = await aiResp.json();
        if (!aiResp.ok) throw new Error(`AI error: ${JSON.stringify(aiData)}`);

        const content = aiData.choices?.[0]?.message?.content || '{}';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const replan = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Failed to parse replan' };

        return new Response(JSON.stringify(replan), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: unknown) {
    console.error('Dynamic replan error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
