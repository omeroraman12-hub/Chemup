import { AUTH } from './config.js';
import { courses, resources, mini, faqs } from './data.js';
const page = document.body.dataset.page;
if (AUTH.url && !localStorage.getItem('chemup_token') && page !== 'auth') location.replace('/auth.html');
const links = [['Home','/'],['This week in ChemUp','/#this-week'],['Courses','/courses.html'],['Mini Lectures','/mini-lectures.html'],['Resources','/resources.html'],['About','/#about'],['Join our team','/#join'],['Contact','/#contact']];
document.body.insertAdjacentHTML('afterbegin', `
<header class="nav"><a class="nav__brand" href="/">Chem<em>Up</em></a>
<nav class="nav__links">${links.map(([n,h]) => `<a href="${h}">${n}</a>`).join('')}<a class="nav__mobile-auth" href="/auth.html">Sign up / Log in</a></nav>
<a class="nav__status" href="/auth.html"><i></i>Sign up</a>
<button class="burger" aria-label="Menu">Menu</button></header>`);
if (localStorage.getItem('chemup_token')) { const st = document.querySelector('.nav__status'); st.innerHTML = '<i></i>Sign out'; st.style.cursor = 'pointer'; st.onclick = (e) => { e.preventDefault(); localStorage.removeItem('chemup_token'); location.href = '/auth.html'; }; }
const navEl = document.querySelector('.nav');
document.querySelector('.burger').onclick = () => navEl.classList.toggle('open');
navEl.querySelectorAll('.nav__links a').forEach((a) => a.addEventListener('click', () => navEl.classList.remove('open')));
const faqHtml = faqs.map(([q, a]) => `<details class="reveal-text"><summary>${q}</summary><p>${a}</p></details>`).join('');
document.querySelectorAll('[data-faq]').forEach((el) => (el.innerHTML = faqHtml));
const cover = (i) => `style="--h:${150 + i * 28}"`;

if (page === 'courses') {
  const grid = document.querySelector('#grid');
  const draw = (q = '') => (grid.innerHTML = courses.map((c, i) => ({ c, i })).filter(({ c }) => c.name.toLowerCase().includes(q.toLowerCase()))
    .map(({ c, i }) => `<a class="card" href="/course.html?c=${c.id}"><div class="cover" ${cover(i)}><span>${c.lessons[0].t}</span></div><h3>${c.name}</h3><p>${c.lessons.length} lessons · latest ${c.lessons[0].d}</p></a>`).join('') || '<p class="dim">No course found.</p>');
  draw(); document.querySelector('#search').addEventListener('input', (e) => draw(e.target.value));
}
if (page === 'course') {
  const c = courses.find((x) => x.id === new URLSearchParams(location.search).get('c')) || courses[0];
  const langs = { en: 'English', tr: 'Türkçe' };
  document.querySelector('#title').textContent = c.name;
  document.querySelector('#lessons').innerHTML = c.lessons.map((l, i) => `<li class="${i ? '' : 'current'}"><span>${l.t}</span><em>${l.d}</em></li>`).join('');
  const set = (l) => { document.querySelector('#vlabel').textContent = `${c.lessons[0].t} — ${langs[l]}`;
    document.querySelector('#pdf').textContent = l === 'en' ? 'Download PDF' : 'PDF indir';
    document.querySelectorAll('.lang button').forEach((b) => b.classList.toggle('on', b.dataset.l === l)); };
  document.querySelectorAll('.lang button').forEach((b) => (b.onclick = () => set(b.dataset.l))); set('en');
}
if (page === 'mini') document.querySelector('#minis').innerHTML = mini.map((m, i) => `<div class="card"><div class="cover" ${cover(i)}><span>▶</span></div><h3>${m.t}</h3><p>${m.m}</p></div>`).join('');
if (page === 'resources') document.querySelector('#res').innerHTML = resources.map((r) => `<a class="row" href="${r.f}" target="_blank" rel="noopener"><div><h3>${r.t}</h3><p>${r.s}</p></div><span>PDF ↓</span></a>`).join('');
