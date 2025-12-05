// Specify Edge Runtime for modern fetch API support
export const config = {
  runtime: 'edge',
};

/**
 * Vercel Edge Function - Solar System API Proxy
 * Bypasses CORS by proxying requests to api.le-systeme-solaire.net
 */
export default async function handler(req: Request): Promise<Response> {
  // Allow CORS
  const headers = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  try {
    // Extract path from URL query (e.g., /api/solar-system?path=bodies/mars)
    const url = new URL(req.url);
    const path = url.searchParams.get('path');

    if (!path) {
      return new Response(
        JSON.stringify({ error: 'Missing path parameter' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    // Build API URL
    const apiUrl = `https://api.le-systeme-solaire.net/rest/${path}`;

    // Fetch from external API
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();

    // Return data
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Solar System API proxy error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch from Solar System API',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  }
}
