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
    const { action, ...params } = await req.json();

    let url: string;
    const baseUrl = 'https://nominatim.openstreetmap.org';

    switch (action) {
      case 'search': {
        const { query, limit = 5 } = params;
        url = `${baseUrl}/search?q=${encodeURIComponent(query)}&format=json&limit=${limit}&addressdetails=1`;
        break;
      }
      case 'reverse': {
        const { lat, lon } = params;
        url = `${baseUrl}/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
        break;
      }
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RadiatorRoutes/1.0',
        'Accept-Language': 'en',
      },
    });
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Nominatim error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
