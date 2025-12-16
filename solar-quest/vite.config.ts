import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import { GoogleGenerativeAI } from '@google/generative-ai'

// Dev middleware: serve /api/proxy-gemini during `npm run dev` so the frontend
// can call the serverless proxy locally without 404. This replicates the
// behavior of `api/proxy-gemini.ts` in the dev server.
function devProxyGemini() {
  return {
    name: 'dev-proxy-gemini',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === '/api/proxy-gemini' && req.method === 'POST') {
          try {
            let body = '';
            for await (const chunk of req) body += chunk;
            const { prompt, model = 'gemini-pro-latest' } = body ? JSON.parse(body) : {};

            if (!prompt || typeof prompt !== 'string') {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing prompt string in request body' }));
              return;
            }

            const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
            if (!API_KEY) {
              console.error('Missing GEMINI_API_KEY in dev environment');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Server misconfiguration: missing Gemini API key' }));
              return;
            }

            let genAI: any = null;
            try {
              genAI = new GoogleGenerativeAI(API_KEY);
            } catch (e) {
              console.error('Failed to initialize GoogleGenerativeAI SDK in dev middleware', e);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to initialize AI SDK' }));
              return;
            }

            const modelClient = genAI.getGenerativeModel({ model });
            const result = await modelClient.generateContent(prompt);
            const text = result?.response?.text?.() || '';

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ text }));
          } catch (err: any) {
            console.error('dev proxy error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err?.message || String(err) }));
          }
          return;
        }
        next();
      });
    }
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devProxyGemini()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api/solar-system': {
        target: 'https://api.le-systeme-solaire.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/solar-system/, ''),
        secure: false,
      }
    }
  }
})
