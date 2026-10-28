// ═══════════════════════════════════════════════════════════════
// KAGE PROXY — Cloudflare Worker
// Deploy: wrangler deploy
// Set secret: wrangler secret put ANTHROPIC_API_KEY
// ═══════════════════════════════════════════════════════════════

// Rate limiting: simple in-memory counter (resets on worker restart)
const RATE_LIMIT = 30; // max requests per IP per hour
const rateCounts = new Map();

function checkRate(ip) {
  const now = Date.now();
  const key = ip;
  let entry = rateCounts.get(key);
  if (!entry || now - entry.start > 3600000) {
    entry = { start: now, count: 0 };
    rateCounts.set(key, entry);
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Rate limit
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!checkRate(ip)) {
      return corsResponse(JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }), 429);
    }

    try {
      const body = await request.json();

      // Validate input
      if (!body.messages || !Array.isArray(body.messages)) {
        return corsResponse(JSON.stringify({ error: 'Invalid request' }), 400);
      }

      // Cap conversation length to prevent abuse
      const messages = body.messages.slice(-20);

      // Forward to Claude
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          system: body.system || '',
          messages: messages,
        }),
      });

      const data = await response.json();

      // Extract text response
      let text = '';
      let action = null;

      if (data.content) {
        for (const block of data.content) {
          if (block.type === 'text') {
            text += block.text;
          }
        }
      }

      // Parse action tags from response
      const actionMatch = text.match(/\[ACTION:(\w+)(?::([^\]]*))?\]/);
      if (actionMatch) {
        action = { type: actionMatch[1], data: actionMatch[2] || null };
        text = text.replace(/\[ACTION:\w+(?::[^\]]*)?]\s*/g, '').trim();
      }

      return corsResponse(JSON.stringify({ text, action }));

    } catch (err) {
      return corsResponse(JSON.stringify({ error: 'Something went wrong.' }), 500);
    }
  },
};

function corsResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
