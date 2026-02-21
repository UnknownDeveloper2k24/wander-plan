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
    const OPENTRIPMAP_API_KEY = Deno.env.get('OPENTRIPMAP_API_KEY');
    if (!OPENTRIPMAP_API_KEY) {
      throw new Error('OPENTRIPMAP_API_KEY is not configured');
    }

    const { action, ...params } = await req.json();

    let url: string;
    const baseUrl = 'https://api.opentripmap.com/0.1/en/places';

    switch (action) {
      case 'radius': {
        const { lat, lon, radius = 5000, kinds = 'interesting_places', limit = 20 } = params;
        url = `${baseUrl}/radius?radius=${radius}&lon=${lon}&lat=${lat}&kinds=${kinds}&limit=${limit}&apikey=${OPENTRIPMAP_API_KEY}`;
        break;
      }
      case 'details': {
        const { xid } = params;
        url = `${baseUrl}/xid/${xid}?apikey=${OPENTRIPMAP_API_KEY}`;
        break;
      }
      case 'autosuggest': {
        const { name, lat, lon, radius = 50000 } = params;
        url = `${baseUrl}/autosuggest?name=${encodeURIComponent(name)}&radius=${radius}&lon=${lon}&lat=${lat}&limit=10&apikey=${OPENTRIPMAP_API_KEY}`;
        break;
      }
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`OpenTripMap API error [${response.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('OpenTripMap error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
