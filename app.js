const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const P = n => String(n).padStart(2, '0');
const K = d => `${d.getFullYear()}-${P(d.getMonth() + 1)}-${P(d.getDate())}`;
const ago = i => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate() - i); };

let S;
try { S = JSON.parse(localStorage.getItem('ht')); } catch (e) { S = null; }
S = S || { n: 4, log: {}, habits: [
  { id: 1, name: 'Exercise for 30 minutes', goal: 20 },
  { id: 2, name: 'Read 10 pages', goal: 20 },
  { id: 3, name: 'Drink 8 glasses of water', goal: 25 } ] };
const save = () => localStorage.setItem('ht', JSON.stringify(S));

let tab = 'today', day = new Date(), vm = new Date();
vm.setDate(1);

const has = (k, id) => (S.log[k] || []).includes(id);
function tog(k, id) {
  const a = S.log[k] = S.log[k] || [], i = a.indexOf(id);
  i < 0 ? a.push(id) : a.splice(i, 1);
  save(); render();
}
function streaks(id) {
  let c = 0, i = has(K(ago(0)), id) ? 0 : 1;
  while (i < 400 && has(K(ago(i)), id)) { c++; i++; }
  let b = 0, r = 0;
  for (let j = 0; j < 400; j++) { r = has(K(ago(j)), id) ? r + 1 : 0; b = Math.max(b, r); }
  return [c, b];
}
const ring = p => `<svg class="ring" viewBox="0 0 100 100"><circle class="bg" cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="42" stroke="#4F7CAC" stroke-dasharray="${p * 263.9} 263.9" transform="rotate(-90 50 50)"/><text x="50" y="58">${Math.round(p * 100)}%</text></svg>`;
const monthNav = () => `<div class="nav"><button onclick="mm(-1)">‹</button><b>${vm.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</b><button onclick="mm(1)">›</button></div>`;
const mv = d => { day.setDate(day.getDate() + d); render(); };
const mm = d => { vm.setMonth(vm.getMonth() + d); render(); };

const T = () => {
  const k = K(day), H = S.habits, n = H.filter(h => has(k, h.id)).length;
  return `<div class="nav"><button onclick="mv(-1)">‹</button><b>${day.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</b><button onclick="mv(1)">›</button></div>
  <div class="card" style="text-align:center">${ring(H.length ? n / H.length : 0)}<div class="sub">${n} / ${H.length} done</div></div>` +
    (H.map(h => { const d = has(k, h.id); return `<button class="row ${d ? 'on' : ''}" onclick="tog('${k}',${h.id})"><span class="chk">${d ? '✓' : ''}</span><span class="nm">${esc(h.name)}</span><span>🔥${streaks(h.id)[0]}</span></button>`; }).join('') || '<p class="sub">Settings me jaake habit add karo</p>');
};

const M = () => {
  const y = vm.getFullYear(), m = vm.getMonth(), N = new Date(y, m + 1, 0).getDate();
  const ds = [...Array(N)].map((_, i) => i + 1);
  return monthNav() + `<div class="sc"><table><tr><th class="f"></th>${ds.map(d => `<th>${d}</th>`).join('')}<th>Done</th></tr>` +
    S.habits.map(h => {
      let c = 0;
      const cells = ds.map(d => { const k = `${y}-${P(m + 1)}-${P(d)}`, o = has(k, h.id); c += o; return `<td class="${o ? 'on' : ''}" onclick="tog('${k}',${h.id})">${o ? '✓' : ''}</td>`; }).join('');
      return `<tr><th class="f">${esc(h.name)}</th>${cells}<th>${c}/${h.goal}</th></tr>`;
    }).join('') + '</table></div>';
};

const X = () => {
  const y = vm.getFullYear(), m = vm.getMonth(), N = new Date(y, m + 1, 0).getDate(), H = S.habits;
  const kk = d => `${y}-${P(m + 1)}-${P(d)}`;
  const rows = H.map(h => { let c = 0; for (let d = 1; d <= N; d++) c += has(kk(d), h.id); return { h, c, p: h.goal ? c / h.goal : 0, s: streaks(h.id) }; }).sort((a, b) => b.p - a.p);
  const tc = rows.reduce((a, r) => a + r.c, 0), tg = H.reduce((a, h) => a + (+h.goal), 0);
  const bars = [...Array(N)].map((_, i) => { const n = H.filter(h => has(kk(i + 1), h.id)).length; return `<i style="height:${H.length ? n / H.length * 100 : 0}%"></i>`; }).join('');
  return monthNav() + `<div class="card" style="text-align:center">${ring(tg ? Math.min(1, tc / tg) : 0)}<div class="sub">Monthly progress · ${tc} check-ins</div></div>
  <div class="card"><b>Top habits</b><br><br>` + rows.map((r, i) => `<div class="rk"><span>${i + 1}. ${esc(r.h.name)}</span><span>${Math.round(r.p * 100)}% · 🔥${r.s[0]} (best ${r.s[1]})</span><div class="bar"><i style="width:${Math.min(100, r.p * 100)}%"></i></div></div>`).join('') +
    `</div><div class="card"><b>Daily progress</b><div class="bars">${bars}</div></div>`;
};

const G = () => `<div class="card"><b>Naya habit</b><input id="hn" placeholder="Habit ka naam"><input id="hg" type="number" value="20" min="1" max="31"><div class="sub">Goal: ek month me kitne din</div><button class="pri" onclick="add()">+ Add habit</button></div>` +
  S.habits.map(h => `<div class="row2"><span>${esc(h.name)} · ${h.goal} din</span><button onclick="ed(${h.id})">✎</button><button onclick="del(${h.id})">🗑</button></div>`).join('') +
  `<div class="card"><b>Backup</b><p class="sub">Data sirf isi phone/browser me save hota hai. Phone badalne ya browser data clear karne se pehle Export zaroor karo.</p><button onclick="exp()">Export</button> <label class="btn">Import<input type="file" hidden onchange="imp(this)"></label></div>`;

const add = () => { const n = $('#hn').value.trim(); if (!n) return; S.habits.push({ id: S.n++, name: n, goal: +$('#hg').value || 20 }); save(); render(); };
const ed = id => { const h = S.habits.find(x => x.id == id), n = prompt('Naam', h.name); if (n === null) return; const g = prompt('Goal (din / month)', h.goal); h.name = n.trim() || h.name; h.goal = +g || h.goal; save(); render(); };
const del = id => { if (confirm('Delete karein? Iska data bhi hat jaayega.')) { S.habits = S.habits.filter(h => h.id != id); for (const k in S.log) S.log[k] = S.log[k].filter(x => x != id); save(); render(); } };
const exp = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: 'application/json' })); a.download = 'habits-backup.json'; a.click(); };
const imp = i => { const r = new FileReader(); r.onload = () => { try { const d = JSON.parse(r.result); if (!d.habits || !d.log) throw 0; S = d; save(); render(); alert('Import ho gaya'); } catch (e) { alert('Galat file'); } }; r.readAsText(i.files[0]); };

const V = { today: T, month: M, stats: X, set: G };
function render() {
  const s = $('.sc'), x = s ? s.scrollLeft : 0;
  $('#app').innerHTML = V[tab]();
  const n = $('.sc'); if (n) n.scrollLeft = x;
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.t === tab));
}
document.querySelectorAll('nav button').forEach(b => b.onclick = () => { tab = b.dataset.t; render(); });
render();
