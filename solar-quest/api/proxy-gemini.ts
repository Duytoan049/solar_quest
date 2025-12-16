/**
 * Serverless proxy for Google Generative AI (Gemini)
 * - Reads the server-side API key from `process.env.GEMINI_API_KEY` (or `GOOGLE_API_KEY`)
 * - Forwards the prompt to the SDK on the server and returns the generated text
 *
 * This keeps the API key out of the browser. Add your key to the deployment env
 * (do NOT commit keys to the repo). In development you can set it in your
 * local environment or `vercel env` if using Vercel.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed, use POST' });
    }

    try {
        const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

        if (!API_KEY) {
            console.error('Missing server-side Gemini API key (process.env.GEMINI_API_KEY)');
            return res.status(500).json({ error: 'Server misconfiguration: missing Gemini API key' });
        }

        const { prompt, model = 'gemini-pro-latest' } = req.body || {};

        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Missing prompt string in request body' });
        }

        // Initialize SDK on the server using the secret key
        let genAI: GoogleGenerativeAI | null = null;

        try {
            genAI = new GoogleGenerativeAI(API_KEY);
        } catch (initErr) {
            console.error('Failed to initialize GoogleGenerativeAI SDK:', initErr);
            return res.status(500).json({ error: 'Failed to initialize AI SDK' });
        }

        const modelClient = genAI.getGenerativeModel({ model });

        // Generate content
        const result = await modelClient.generateContent(prompt);
        const text = result?.response?.text?.() || '';

        return res.status(200).json({ text });
    } catch (error: any) {
        console.error('proxy-gemini error:', error);
        return res.status(500).json({ error: error?.message || String(error) });
    }
}
