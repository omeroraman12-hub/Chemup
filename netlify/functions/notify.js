const CORS = {
  'Access-Control-Allow-Origin': 'https://chemistryupbound.org',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });
  const { name = '', email = '', school = '' } = await req.json();
  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ allowed_mentions: { parse: [] },
      content: `🧪 **New ChemUp sign-up**\n${String(name).slice(0, 80)} · ${String(email).slice(0, 120)} · ${String(school).slice(0, 120)}` }),
  });
  return new Response('ok', { headers: CORS });
};
export const config = { path: '/api/notify' };
