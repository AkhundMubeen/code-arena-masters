import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const PISTON_API = 'https://emkc.org/api/v2/piston/execute';

// Alternative free Piston instances to try
const PISTON_ALTERNATIVES = [
  'https://piston.guap.dev/api/v2/execute',
  'https://piston-api.fly.dev/api/v2/execute',
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { language, version, files, stdin } = await req.json();

    if (!language || !files || !Array.isArray(files)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: language, files' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = JSON.stringify({ language, version, files, stdin: stdin || '' });

    // Try each Piston endpoint until one works
    const endpoints = [PISTON_API, ...PISTON_ALTERNATIVES];
    let lastError = '';

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        });

        if (response.ok) {
          const data = await response.json();
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        lastError = `${endpoint}: ${response.status} ${await response.text()}`;
        console.log(`Piston endpoint failed: ${lastError}`);
      } catch (e) {
        lastError = `${endpoint}: ${e.message}`;
        console.log(`Piston endpoint error: ${lastError}`);
      }
    }

    return new Response(
      JSON.stringify({ error: 'All code execution endpoints failed', details: lastError }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
