/**
 * Vercel Serverless Function - Solar System API Proxy
 * Bypasses CORS by proxying requests to api.le-systeme-solaire.net
 */
export default async function handler(req: any, res: any) {
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

        console.log('Proxying request to:', apiUrl);

        // Use native fetch (Node 18+) or import https module
        const https = require('https');
        const { URL } = require('url');

        const parsedUrl = new URL(apiUrl);

        const apiData = await new Promise((resolve, reject) => {
            const options = {
                hostname: parsedUrl.hostname,
                port: 443,
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Solar-Quest-App/1.0'
                }
            };

            https.get(options, (apiRes: any) => {
                let data = '';

                apiRes.on('data', (chunk: any) => {
                    data += chunk;
                });

                apiRes.on('end', () => {
                    console.log('API response status:', apiRes.statusCode);
                    if (apiRes.statusCode === 200) {
                        try {
                            resolve(JSON.parse(data));
                        } catch (e) {
                            reject(new Error('Failed to parse JSON'));
                        }
                    } else {
                        console.error('API error response:', data);
                        reject(new Error(`API responded with status ${apiRes.statusCode}: ${data}`));
                    }
                });
            }).on('error', reject);
        });

        // Return data
        return res.status(200).json(apiData);
    } catch (error: any) {
        console.error('Solar System API proxy error:', error);
        return res.status(500).json({
            error: 'Failed to fetch from Solar System API',
            details: error?.message || 'Unknown error',
            apiUrl: `https://api.le-systeme-solaire.net/rest/${req.query.path || ''}`
        });
    }
}
