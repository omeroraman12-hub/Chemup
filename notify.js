// Receives name/email/school after sign-up and posts it to a private Discord channel.
// Set DISCORD_WEBHOOK_URL in Netlify > Site settings > Environment variables. Never put it in frontend code.
export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const { name = '', email = '', school = '' } = await req.json();
  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ allowed_mentions: { parse: [] },
      content: `🧪 **New ChemUp sign-up**\n${String(name).slice(0, 80)} · ${String(email).slice(0, 120)} · ${String(school).slice(0, 120)}` }),
  });
  return new Response('ok');
};
export const config = { path: '/api/notify' };
