export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return new Response(
      JSON.stringify({ error: 'GEMINI_API_KEY is not set in environment variables' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  let body;
  try { body = await req.json(); }
  catch { return new Response('Invalid JSON', { status: 400 }); }

  const { messages = [], system = '' } = body;

  // Convert to Gemini format (user/model roles, no system in contents)
  let contents = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

  // Gemini requires alternating roles — merge consecutive same-role messages
  const deduped = [];
  for (const msg of contents) {
    if (deduped.length && deduped[deduped.length - 1].role === msg.role) {
      deduped[deduped.length - 1].parts[0].text += '\n' + msg.parts[0].text;
    } else {
      deduped.push(msg);
    }
  }
  // Must start with user
  if (deduped.length && deduped[0].role === 'model') deduped.shift();
  if (!deduped.length) return new Response('No messages', { status: 400 });

  const geminiBody = {
    contents: deduped,
    ...(system && { systemInstruction: { parts: [{ text: system }] } }),
    generationConfig: { temperature: 0.72, maxOutputTokens: 1200, topK: 35, topP: 0.9 }
  };

  // Support both AIza (API key) and AQ. (OAuth token) formats
  const isOAuth = key.startsWith('AQ.') || key.startsWith('ya29.');
  const geminiResp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse${isOAuth ? '' : '&key='+key}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key, ...(isOAuth && { 'Authorization': `Bearer ${key}` }) }, body: JSON.stringify(geminiBody) }
  );

  if (!geminiResp.ok) {
    const err = await geminiResp.text();
    return new Response(err, {
      status: geminiResp.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  return new Response(geminiResp.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no'
    }
  });
}
