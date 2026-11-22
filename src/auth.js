import { AUTH } from './config.js';
const $ = (s) => document.querySelector(s);
const msg = (t, err) => { const m = $('#msg'); m.textContent = t; m.classList.toggle('err', !!err); };
const show = (t) => { document.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === t));
  $('#signup').hidden = t !== 'signup'; $('#login').hidden = t !== 'login'; msg(''); };
document.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => show(b.dataset.tab)));
const api = (path, body) => fetch(`${AUTH.url}/auth/v1/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: AUTH.anonKey }, body: JSON.stringify(body) })
  .then(async (r) => { const j = await r.json(); if (!r.ok) throw new Error(j.msg || j.error_description || 'Something went wrong'); return j; });

$('#signup').addEventListener('submit', async (e) => {
  e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); msg('Creating your account…');
  try {
    if (AUTH.url) await api('signup', { email: f.email, password: f.password, data: { name: f.name, school: f.school, country: f.country } });
    if (AUTH.notifyUrl) fetch(AUTH.notifyUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: f.name, email: f.email, school: f.school, country: f.country }) }).catch(() => {});
    msg(AUTH.url ? 'Done. Check your email to confirm, then log in.' : 'Demo mode: backend not connected yet, nothing was saved.');
  } catch (err) { msg(err.message, true); }
});
$('#login').addEventListener('submit', async (e) => {
  e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); msg('Logging in…');
  try {
    if (AUTH.url) { const j = await api('token?grant_type=password', { email: f.email, password: f.password }); localStorage.setItem('chemup_token', j.access_token); localStorage.setItem('chemup_refresh', j.refresh_token); }
    const next = new URLSearchParams(location.search).get('next');
    location.href = next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
  } catch (err) { msg(err.message, true); }
});
