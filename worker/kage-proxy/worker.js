// Kage proxy (Cloudflare Worker): the chat backend for the Kage assistant on the portfolio.
// Gemini (free tier) answers first when GEMINI_API_KEY is set; Workers AI (free allowance,
// no key) answers when Gemini is missing, rate-limited or down.
//
// Deploy from this folder:
//   npx wrangler login
//   npx wrangler secret put GEMINI_API_KEY   (optional: a free key from Google AI Studio)
//   npx wrangler deploy

const ORIGINS = ['https://saikirankumarnalla.github.io'];
const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const RATE_LIMIT = 30; // requests per IP per hour (per worker instance)
const MAX_SYSTEM = 16000; // characters
const MAX_TOKENS = 400;
const WORKERS_AI_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

const rate = new Map();
function allowed(ip) {
  const now = Date.now();
  let e = rate.get(ip);
  if (!e || now - e.start > 3600000) rate.set(ip, (e = { start: now, count: 0 }));
  return ++e.count <= RATE_LIMIT;
}

function cors(origin) {
  const ok = ORIGINS.includes(origin) || LOCAL.test(origin || '');
  return {
    'Access-Control-Allow-Origin': ok ? origin : ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

const json = (body, status, headers) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

// Model names come and go, so try the configured one, then Google's "latest" aliases.
// A 404 moves on to the next name; a 400 retries once without the thinking setting.
async function askGemini(env, system, messages) {
  const models = [...new Set([env.GEMINI_MODEL, 'gemini-flash-latest', 'gemini-flash-lite-latest'].filter(Boolean))];
  const base = {
    systemInstruction: { parts: [{ text: system }] },
    contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
  };
  let last = 'Gemini: no model';
  for (const model of models) {
    for (const thinking of [true, false]) {
      const generationConfig = { maxOutputTokens: MAX_TOKENS, temperature: 0.6, ...(thinking ? { thinkingConfig: { thinkingBudget: 0 } } : {}) };
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
        body: JSON.stringify({ ...base, generationConfig }),
        signal: AbortSignal.timeout(25000), // never let a slow model stall the chat
      }).catch((e) => ({ ok: false, status: e.name === 'TimeoutError' ? 504 : 502 }));
      if (res.ok) {
        const data = await res.json();
        const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim();
        if (text) return text;
        last = `Gemini ${model}: empty`;
        break;
      }
      last = `Gemini ${model}: ${res.status}`;
      if (res.status !== 400) break; // 404 → next model; 429/5xx → next model too
    }
  }
  throw new Error(last);
}

async function askWorkersAI(env, system, messages) {
  const out = await env.AI.run(WORKERS_AI_MODEL, { messages: [{ role: 'system', content: system }, ...messages], max_tokens: MAX_TOKENS });
  const text = (out?.response || '').trim();
  if (!text) throw new Error('Workers AI empty');
  return text;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const headers = cors(origin);
    if (request.method === 'OPTIONS') return new Response(null, { headers });
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, headers);
    if (origin && !ORIGINS.includes(origin) && !LOCAL.test(origin)) return json({ error: 'Forbidden' }, 403, headers);
    if (!allowed(request.headers.get('CF-Connecting-IP') || 'unknown')) return json({ error: 'Rate limit exceeded. Try again later.' }, 429, headers);

    let body;
    try { body = await request.json(); } catch { return json({ error: 'Invalid request' }, 400, headers); }
    if (!Array.isArray(body.messages)) return json({ error: 'Invalid request' }, 400, headers);
    const system = String(body.system || '').slice(0, MAX_SYSTEM);
    const messages = body.messages.slice(-12)
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
    if (!messages.length || messages[messages.length - 1].role !== 'user') return json({ error: 'Invalid request' }, 400, headers);

    let text = '', model = '';
    if (env.GEMINI_API_KEY) {
      try { text = await askGemini(env, system, messages); model = 'gemini'; } catch (e) { console.warn(String(e)); }
    }
    if (!text && env.AI) {
      try { text = await askWorkersAI(env, system, messages); model = 'workers-ai'; } catch (e) { console.warn(String(e)); }
    }
    if (!text) return json({ error: 'Kage is unavailable right now.' }, 503, headers);

    // Navigation tags: [ACTION:navigate:KEY]
    let action = null;
    const m = text.match(/\[ACTION:(\w+)(?::([^\]]*))?\]/);
    if (m) action = { type: m[1], data: m[2] || null };
    text = text.replace(/\[ACTION:[^\]]*\]\s*/g, '').trim();
    return json({ text, action, model }, 200, headers);
  },
};
