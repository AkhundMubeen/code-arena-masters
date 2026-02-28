import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';

// Judge0 language IDs
const LANGUAGE_MAP: Record<string, number> = {
  python: 71,   // Python 3.8.1
  java: 62,     // Java (OpenJDK 13.0.1)
  cpp: 54,      // C++ (GCC 9.2.0)
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
  if (!RAPIDAPI_KEY) {
    return new Response(
      JSON.stringify({ error: 'RAPIDAPI_KEY not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { language, files, stdin } = await req.json();
    const langId = LANGUAGE_MAP[language];

    if (!langId || !files?.[0]?.content) {
      return new Response(
        JSON.stringify({ error: 'Invalid language or missing code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Submit code to Judge0
    const submitRes = await fetch(`${JUDGE0_API}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
      body: JSON.stringify({
        source_code: files[0].content,
        language_id: langId,
        stdin: stdin || '',
      }),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      console.error('Judge0 error:', submitRes.status, errText);
      return new Response(
        JSON.stringify({ error: 'Code execution failed', details: errText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await submitRes.json();

    // Map Judge0 response to Piston-compatible format
    const response = {
      run: {
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        code: result.exit_code,
        signal: null,
        output: result.stdout || '',
      },
      compile: {
        stderr: result.compile_output || '',
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
