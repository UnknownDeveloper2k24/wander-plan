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
    const AMADEUS_API_KEY = Deno.env.get('AMADEUS_API_KEY');
    const AMADEUS_API_SECRET = Deno.env.get('AMADEUS_API_SECRET');
    if (!AMADEUS_API_KEY) throw new Error('AMADEUS_API_KEY is not configured');
    if (!AMADEUS_API_SECRET) throw new Error('AMADEUS_API_SECRET is not configured');

    // Get access token
    const tokenRes = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${AMADEUS_API_KEY}&client_secret=${AMADEUS_API_SECRET}`,
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      throw new Error(`Amadeus auth failed [${tokenRes.status}]: ${JSON.stringify(tokenData)}`);
    }
    const accessToken = tokenData.access_token;

    const { action, ...params } = await req.json();
    let url: string;
    const baseUrl = 'https://test.api.amadeus.com';

    switch (action) {
      case 'flight-offers': {
        const { origin, destination, departureDate, adults = 1, max = 5 } = params;
        url = `${baseUrl}/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=${adults}&max=${max}&currencyCode=INR`;
        break;
      }
      case 'hotel-offers': {
        const { cityCode, checkInDate, checkOutDate, adults = 1 } = params;
        url = `${baseUrl}/v3/shopping/hotel-offers?hotelIds=${cityCode}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&adults=${adults}&currency=INR`;
        break;
      }
      case 'city-search': {
        const { keyword } = params;
        url = `${baseUrl}/v1/reference-data/locations?subType=CITY&keyword=${encodeURIComponent(keyword)}&page%5Blimit%5D=5`;
        break;
      }
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Amadeus API error [${response.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Amadeus error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
