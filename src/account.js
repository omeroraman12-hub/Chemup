import { AUTH } from './config.js';
const $ = (s) => document.querySelector(s);
const head = (t) => ({ apikey: AUTH.anonKey, Authorization: `Bearer ${t}` });
const getUser = (t) => fetch(`${AUTH.url}/auth/v1/user`, { headers: head(t) });
(async () => {
  let r = await getUser(localStorage.getItem('chemup_token'));
  if (r.status === 401 && localStorage.getItem('chemup_refresh')) {
    const rr = await fetch(`${AUTH.url}/auth/v1/token?grant_type=refresh_token`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: AUTH.anonKey }, body: JSON.stringify({ refresh_token: localStorage.getItem('chemup_refresh') }) });
    if (rr.ok) { const j = await rr.json(); localStorage.setItem('chemup_token', j.access_token); localStorage.setItem('chemup_refresh', j.refresh_token); r = await getUser(j.access_token); }
  }
  if (!r.ok) { localStorage.removeItem('chemup_token'); localStorage.removeItem('chemup_refresh'); location.replace('/auth.html?next=/account.html'); return; }
  const u = await r.json(), m = u.user_metadata || {};
  const f = { name: m.name, email: u.email, school: m.school, country: m.country, since: u.created_at && new Date(u.created_at).toLocaleDateString('en-GB') };
  Object.entries(f).forEach(([k, v]) => ($(`#a-${k}`).textContent = v || '—'));
})();
