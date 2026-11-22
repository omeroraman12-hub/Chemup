import { AUTH } from './config.js';
import { courses, faqs, courseFaqs } from './data.js';
const page = document.body.dataset.page;
const token = localStorage.getItem('chemup_token');
// Only courses, lessons, resources and the account page need an account
if (AUTH.url && !token && ['courses', 'course', 'resources', 'account'].includes(page))
  location.replace('/auth.html?next=' + encodeURIComponent(location.pathname + location.search));
const logout = () => { localStorage.removeItem('chemup_token'); localStorage.removeItem('chemup_refresh'); location.href = '/'; };
const cu = (s) => s.replace('ChemUp', '<span class="cu">ChemUp</span>');
const links = [['Home','/'],['This week in ChemUp','/#this-week'],['Courses','/courses.html'],['Mini Lectures','/mini-lectures.html'],['Resources','/resources.html'],['About','/#about'],['Join our team','/#join'],['Contact','/#contact']];
const acct = token ? '<a href="/account.html">My account</a><a href="#" data-logout>Log out</a>' : '<a href="/auth.html">Sign up / Log in</a>';
document.body.insertAdjacentHTML('afterbegin', `
<header class="nav"><a class="nav__brand" href="/">Chem<em>Up</em><small>Chemistry Upbound</small></a>
<nav class="nav__links">${links.map(([n, h]) => `<a href="${h}">${cu(n)}</a>`).join('')}<span class="nav__mobile-auth">${acct}</span></nav>
<span class="nav__status">${token ? acct : '<i></i><a href="/auth.html">Sign up</a>'}</span>
<button class="burger" aria-label="Menu">Menu</button></header>`);
const navEl = document.querySelector('.nav');
document.querySelector('.burger').onclick = () => navEl.classList.toggle('open');
navEl.querySelectorAll('.nav__links a').forEach((a) => a.addEventListener('click', () => navEl.classList.remove('open')));
document.querySelectorAll('[data-logout]').forEach((a) => (a.onclick = (e) => { e.preventDefault(); logout(); }));
document.querySelectorAll('[data-faq]').forEach((el) => (el.innerHTML = (el.dataset.faq === 'course' ? courseFaqs : faqs).map(([q, a]) => `<details class="reveal-text"><summary>${q}</summary><p>${a}</p></details>`).join('')));
const cover = (i) => `style="--h:${150 + i * 28}"`;
const none = '<p class="dim">No content yet.</p>';

if (page === 'courses') {
  const grid = document.querySelector('#grid');
  const draw = (q = '') => (grid.innerHTML = courses.map((c, i) => ({ c, i })).filter(({ c }) => c.name.toLowerCase().includes(q.toLowerCase()))
    .map(({ c, i }) => { const l = c.lessons[0];
      return `<a class="card" href="/course.html?c=${c.id}"><div class="cover" ${cover(i)}><span>${l ? l.t : 'No content yet'}</span></div><h3>${c.name}</h3><p>${l ? `${c.lessons.length} lesson${c.lessons.length > 1 ? 's' : ''} · latest ${l.d}` : 'No content yet'}</p></a>`; }).join('') || none);
  draw(); document.querySelector('#search').addEventListener('input', (e) => draw(e.target.value));
}
if (page === 'course') {
  const c = courses.find((x) => x.id === new URLSearchParams(location.search).get('c')) || courses[0];
  const l0 = c.lessons[0];
  document.querySelector('#title').textContent = c.name;
  document.querySelector('#lessons').innerHTML = l0 ? c.lessons.map((l, i) => `<li class="${i ? '' : 'current'}"><a href="${l.pdf}" target="_blank" rel="noopener">${l.t}</a><em>${l.d}</em></li>`).join('') : '<li><span class="dim">No content yet</span></li>';
  const pdf = document.querySelector('#pdf');
  if (l0) pdf.href = l0.pdf; else pdf.hidden = true;
  const msg = { en: [l0 ? 'No video yet' : 'No content yet', 'Download PDF'], tr: [l0 ? 'Henüz video yok' : 'Henüz içerik yok', 'PDF indir'] };
  const set = (l) => { document.querySelector('#vmsg').textContent = msg[l][0]; pdf.textContent = msg[l][1];
    document.querySelectorAll('.lang button').forEach((b) => b.classList.toggle('on', b.dataset.l === l)); };
  document.querySelectorAll('.lang button').forEach((b) => (b.onclick = () => set(b.dataset.l))); set('en');
}
if (page === 'mini') document.querySelector('#minis').innerHTML = none;
if (page === 'resources') {
  const items = courses.flatMap((c) => c.lessons.map((l) => ({ ...l, course: c.name })));
  document.querySelector('#res').innerHTML = items.length ? items.map((r) => `<a class="row" href="${r.pdf}" target="_blank" rel="noopener"><div><h3>${r.t}</h3><p>${r.course} · PDF</p></div><span>PDF ↓</span></a>`).join('') : none;
}
