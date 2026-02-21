import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TOMTOM_API_KEY = Deno.env.get('TOMTOM_API_KEY');
    if (!TOMTOM_API_KEY) throw new Error('TOMTOM_API_KEY is not configured');

    const { action, ...params } = await req.json();
    const baseUrl = 'https://api.tomtom.com';
    let url: string;

    switch (action) {
      case 'traffic-flow': {
        const { lat, lon, zoom = 10 } = params;
        url = `${baseUrl}/traffic/services/4/flowSegmentData/absolute/${zoom}/json?point=${lat},${lon}&key=${TOMTOM_API_KEY}`;
        break;
      }
      case 'route': {
        const { origin, destination } = params;
        url = `${baseUrl}/routing/1/calculateRoute/${origin.lat},${origin.lon}:${destination.lat},${destination.lon}/json?key=${TOMTOM_API_KEY}&traffic=true`;
        break;
      }
      case 'search': {
        const { query, lat, lon } = params;
        url = `${baseUrl}/search/2/search/${encodeURIComponent(query)}.json?key=${TOMTOM_API_KEY}&lat=${lat}&lon=${lon}&radius=50000&limit=10`;
        break;
      }
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`TomTom API error [${response.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('TomTom error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
