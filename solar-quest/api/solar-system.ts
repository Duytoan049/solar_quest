import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function - Solar System API Proxy
 * Bypasses CORS by proxying requests to api.le-systeme-solaire.net
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Allow CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Extract path from query (e.g., /api/solar-system?path=bodies/mars)
        const { path } = req.query;

        if (!path || typeof path !== 'string') {
            return res.status(400).json({ error: 'Missing path parameter' });
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
        return res.status(200).json(data);
    } catch (error) {
        console.error('Solar System API proxy error:', error);
        return res.status(500).json({
            error: 'Failed to fetch from Solar System API',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
