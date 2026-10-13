"use strict";
/* ============================================================
   SDA Indonesia — slide interaktif
   Setiap slide = gambar latar + lapisan tombol transparan.
   Semua koordinat berupa pecahan (0..1) dari lebar/tinggi gambar.
   Tambahkan ?debug di URL untuk melihat kotak tombolnya.
   ============================================================ */
const $ = (s, r = document) => r.querySelector(s);
const DEBUG = /debug/.test(location.search);

/* ---- Urutan slide ---- */
const MATERI = ["m_konsep", "m_hutan", "m_flora", "m_laut", "m_tani", "m_tambang", "m_energi", "m_lestari"];
const QUIZ = ["q1", "q2", "q4", "q5"];
const ALL = ["start", "home", ...MATERI, ...QUIZ, "blank"];
const SRC = (id) => `slides/${id}.webp`;
const SIZE = (id) => (id[0] === "q" ? [1024, 768] : [1600, 1131]);

/* ---- Tombol « » yang sudah tergambar di slide: [prev, next] = [x0,y0,x1,y1] ---- */
const NAV = {
  m_konsep:  [null, [.886, .866, .976, .991]],
  m_hutan:   [[.009, .866, .098, .992], [.890, .866, .979, .991]],
  m_flora:   [[.026, .860, .114, .988], [.884, .863, .974, .988]],
  m_laut:    [[.009, .866, .097, .991], [.894, .865, .982, .988]],
  m_tani:    [[.009, .854, .098, .989], [.888, .864, .977, .988]],
  m_tambang: [[.009, .852, .100, .989], [.883, .861, .974, .989]],
  m_energi:  [[.009, .853, .098, .991], [.894, .865, .982, .988]],
  m_lestari: [[.009, .851, .100, .989], [.891, .860, .982, .988]],
  q1: [[.027, .870, .104, .970], [.898, .868, .976, .969]],
  q2: [[.027, .857, .103, .960], [.906, .865, .981, .962]],
  q4: [[.027, .872, .098, .966], [.893, .866, .964, .958]],
  q5: [[.027, .857, .103, .960], [.901, .857, .976, .954]],
};

/* ---- Pilihan jawaban: ans = indeks jawaban benar (0=A), x = [kiri,kanan], y = titik tengah A-D ---- */
const OPTS = {
  q1: { ans: 1, x: [.163, .785], y: [.4785, .584, .681, .792] },   // B. Sumber daya alam
  q2: { ans: 2, x: [.200, .805], y: [.384, .5135, .6385, .772] },  // C. Hutan
  q4: { ans: 0, x: [.180, .785], y: [.387, .486, .613, .7235] },   // A. Garis khatulistiwa
  q5: { ans: 1, x: [.162, .835], y: [.368, .494, .609, .739] },    // B. Hasil hutan kayu
};
const HALF = 0.034; // setengah tinggi pill jawaban

/* ---- State kuis ---- */
const quiz = { picked: {} };
const score = () => QUIZ.filter((q) => quiz.picked[q] === OPTS[q].ans).length;

/* ---- Pembuat hotspot ---- */
const box = (x0, y0, x1, y1, pad = 0.008) => [x0 - pad, y0 - pad, x1 - x0 + pad * 2, y1 - y0 + pad * 2];
function hot(b, label, fn, cls = "") {
  return { b, label, fn, cls };
}
function hotspots(id) {
  if (id === "start") return [hot([.357, .537, .286, .123], "Mulai", () => go("home"), "pill")];
  if (id === "home") return [
    hot([.170, .425, .216, .306], "Materi", () => go(MATERI[0])),
    hot([.600, .425, .216, .306], "Kuis", startQuiz),
  ];
  const list = MATERI.includes(id) ? MATERI : QUIZ.includes(id) ? QUIZ : null;
  if (!list) return [];
  const i = list.indexOf(id), last = i === list.length - 1;
  const [p, n] = NAV[id];
  const out = [];
  if (p) out.push(hot(box(...p), "Sebelumnya", () => go(i > 0 ? list[i - 1] : "home", "back")));
  if (n) out.push(hot(box(...n), "Berikutnya", () => (last ? (list === MATERI ? startQuiz() : go("blank")) : go(list[i + 1]))));
  if (OPTS[id]) {
    const o = OPTS[id];
    o.y.forEach((cy, k) => out.push(hot([o.x[0], cy - HALF, o.x[1] - o.x[0], HALF * 2], "ABCD"[k], () => pick(id, k), "pill opt")));
  }
  return out;
}

/* ---- Kuis ---- */
function startQuiz() {
  quiz.picked = {};
  go(QUIZ[0]);
}
function pick(id, k) {
  if (quiz.picked[id] !== undefined) return;
  quiz.picked[id] = k;
  paintOpts($(".slide:not(.out)"), id);
}
function paintOpts(el, id) {
  if (!el || !OPTS[id]) return;
  const k = quiz.picked[id], ans = OPTS[id].ans;
  el.querySelectorAll(".opt").forEach((b, n) => {
    b.classList.toggle("locked", k !== undefined);
    b.classList.toggle("right", k !== undefined && n === ans);
    b.classList.toggle("wrong", k !== undefined && n === k && k !== ans);
  });
}

/* ---- Render slide ---- */
let current = null;
const stage = $("#stage");
function build(id) {
  const [w, h] = SIZE(id);
  const el = document.createElement("div");
  el.className = "slide" + (DEBUG ? " debug" : "");
  el.innerHTML = `<div class="fill" style="background-image:url(${SRC(id)})"></div>
    <div class="frame" style="--ar:${w / h}"><img src="${SRC(id)}" alt="" draggable="false"></div>`;
  const frame = $(".frame", el);
  hotspots(id).forEach((s) => {
    const b = document.createElement("button");
    b.className = "hot " + s.cls;
    b.setAttribute("aria-label", s.label);
    b.style.cssText = `left:${s.b[0] * 100}%;top:${s.b[1] * 100}%;width:${s.b[2] * 100}%;height:${s.b[3] * 100}%`;
    b.onclick = s.fn;
    frame.appendChild(b);
  });
  if (id === "blank") frame.appendChild(resultView());
  paintOpts(el, id);
  return el;
}
function resultView() {
  const n = score(), t = QUIZ.length;
  const msg = n === t ? "Hebat! Semua jawabanmu benar." : n >= t / 2 ? "Bagus! Terus belajar ya." : "Ayo baca materinya lagi.";
  const d = document.createElement("div");
  d.className = "result";
  d.innerHTML = `<div class="tag">HASIL KUIS</div><div class="big">${n}/${t}</div><p class="msg">${msg}</p>
    <div class="row"><button class="rbtn" id="again">ULANGI</button><button class="rbtn alt" id="tomenu">MENU</button></div>`;
  $("#again", d).onclick = startQuiz;
  $("#tomenu", d).onclick = () => go("home", "back");
  return d;
}
function fit() {
  document.querySelectorAll(".frame").forEach((f) => f.style.setProperty("--u", f.clientWidth / 100 + "px"));
}
function show(id, dir) {
  const el = build(id);
  if (dir === "back") el.classList.add("back");
  [...stage.children].forEach((o) => { o.classList.add("out"); setTimeout(() => o.remove(), 340); });
  stage.appendChild(el);
  current = id;
  fit();
  $("#homebtn").hidden = !(MATERI.includes(id) || QUIZ.includes(id) || id === "blank");
}
addEventListener("resize", fit);

/* ---- Navigasi + riwayat (tombol Back HP), URL tidak berubah ---- */
function go(id, dir, replace) {
  try { replace ? history.replaceState({ id }, "") : history.pushState({ id }, ""); } catch (e) {}
  show(id, dir);
}
addEventListener("popstate", (e) => show(e.state && e.state.id ? e.state.id : "home", "back"));
$("#homebtn").onclick = () => go("home", "back");

/* ---- Keyboard (untuk PC): panah = geser slide, Enter = mulai, Esc/Home = menu ---- */
addEventListener("keydown", (e) => {
  const s = $(".slide:not(.out)");
  if (!s || !introDone) return;
  const press = (label) => { const b = s.querySelector(`.hot[aria-label="${label}"]`); if (b) { b.click(); e.preventDefault(); } };
  if (e.key === "ArrowRight" || e.key === "PageDown") press("Berikutnya");
  else if (e.key === "ArrowLeft" || e.key === "PageUp") press("Sebelumnya");
  else if (e.key === "Enter" || e.key === " ") press("Mulai");
  else if ((e.key === "Escape" || e.key === "Home") && current !== "start" && current !== "home") go("home", "back");
});

/* ---- Mulai: intro logo -> slide START ---- */
let introDone = false;
function endIntro() {
  if (introDone) return;
  introDone = true;
  $("#intro").hidden = true;
  go("start", null, true);
  ALL.forEach((id) => { const i = new Image(); i.src = SRC(id); });
  setTimeout(() => $("#rotate").classList.add("gone"), 6000);
}
$("#intro").addEventListener("click", endIntro);
setTimeout(endIntro, 2400);
