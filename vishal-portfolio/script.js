/* =========================================================
   Vishal Chandravanshi – Portfolio
   ========================================================= */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;

/* ---------- Loader ---------- */
const loader = $("#loader");
const hideLoader = () => loader && loader.classList.add("done");
window.addEventListener("load", () => setTimeout(hideLoader, 900));
setTimeout(hideLoader, 3000);

/* ---------- Split heading into animated words ---------- */
$$("[data-split]").forEach(el => {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map((w, i) => `<span class="w"><span class="wi" style="transition-delay:${0.25 + i * 0.09}s">${w}</span></span>`).join(" ");
});

/* ---------- Typing roles ---------- */
const roles = ["Cloud & DevOps Engineer", "AWS Certified Solutions Architect", "Kubernetes & GitOps Enthusiast", "Infrastructure as Code with Terraform", "Observability: Prometheus & Grafana"];
const typed = $("#typed");
let ri = 0, ci = 0, del = false;
(function type() {
  const word = roles[ri];
  typed.textContent = word.slice(0, ci);
  if (!del && ci < word.length) ci++;
  else if (!del) { del = true; return setTimeout(type, 1600); }
  else if (ci > 0) ci--;
  else { del = false; ri = (ri + 1) % roles.length; }
  setTimeout(type, del ? 30 : 70);
})();

/* ---------- Hero network canvas ---------- */
const cv = $("#net"), cx = cv.getContext("2d");
let W, H, pts = [], mouse = { x: null, y: null };
function sizeNet() {
  W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight;
  const n = Math.min(90, Math.floor(W * H / 16000));
  pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45, r: Math.random() * 1.6 + .5 }));
}
addEventListener("resize", sizeNet);
$("#home").addEventListener("mousemove", e => { const b = cv.getBoundingClientRect(); mouse.x = e.clientX - b.left; mouse.y = e.clientY - b.top; });
$("#home").addEventListener("mouseleave", () => mouse.x = mouse.y = null);
let heroVisible = true;
new IntersectionObserver(([e]) => heroVisible = e.isIntersecting).observe($("#home"));
(function drawNet() {
  if (heroVisible) {
    cx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]; p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
      cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fillStyle = "rgba(90,208,255,.8)"; cx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 125) { cx.strokeStyle = `rgba(43,149,214,${(1 - d / 125) * .4})`; cx.lineWidth = .8; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(q.x, q.y); cx.stroke(); }
      }
      if (mouse.x !== null) {
        const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (d < 160) { cx.strokeStyle = `rgba(90,208,255,${(1 - d / 160) * .6})`; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(mouse.x, mouse.y); cx.stroke(); p.x += (mouse.x - p.x) * .008; p.y += (mouse.y - p.y) * .008; }
      }
    }
  }
  requestAnimationFrame(drawNet);
})();
sizeNet();

/* ---------- Scroll reveal (with stagger) + counters ---------- */
["#tiles", ".svc-grid", ".cert-grid", ".edu-row", ".hero-text", ".facts"].forEach(sel => {
  const p = $(sel); if (!p) return;
  [...p.children].forEach((c, i) => c.style.setProperty("--d", (i * 0.07) + "s"));
});
const countUp = el => {
  const t = +el.dataset.count; let n = 0;
  const step = () => { n += Math.max(1, t / 45); if (n >= t) n = t; el.textContent = Math.round(n) + (t > 5 ? "+" : ""); if (n < t) requestAnimationFrame(step); };
  step();
};
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add("show");
  $$("[data-count]", e.target).forEach(countUp);
  io.unobserve(e.target);
}), { threshold: .12 });
$$(".reveal,.reveal-l,.reveal-r").forEach(el => {
  if (el.closest(".hero")) setTimeout(() => { el.classList.add("show"); $$("[data-count]", el).forEach(countUp); }, 700 + (parseFloat(getComputedStyle(el).getPropertyValue("--d")) || 0) * 1000);
  else io.observe(el);
});

/* ---------- Nav ---------- */
const nav = $("#nav"), progress = $("#progress");
const links = $$(".nav-links a"), secs = links.map(a => $(a.getAttribute("href")));
const tlFill = $("#tlFill"), timeline = $("#timeline");
function onScroll() {
  nav.classList.toggle("scrolled", scrollY > 40);
  progress.style.width = scrollY / (document.documentElement.scrollHeight - innerHeight) * 100 + "%";
  const pos = scrollY + innerHeight / 3;
  secs.forEach((s, i) => { if (s && s.offsetTop <= pos && s.offsetTop + s.offsetHeight > pos) { links.forEach(l => l.classList.remove("active")); links[i].classList.add("active"); } });
  if (timeline) {
    const r = timeline.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (innerHeight * .6 - r.top) / r.height));
    tlFill.style.height = f * 100 + "%";
  }
}
addEventListener("scroll", onScroll, { passive: true }); onScroll();
const burger = $("#burger"), menu = $("#navLinks");
burger.addEventListener("click", () => { burger.classList.toggle("open"); menu.classList.toggle("open"); });
links.forEach(l => l.addEventListener("click", () => { burger.classList.remove("open"); menu.classList.remove("open"); }));

/* ---------- Hero parallax (uses the independent `translate` property) ---------- */
const stage = $("#stage");
if (fine) {
  const layers = $$("[data-depth]", stage);
  const portrait = $("#portrait");
  let tx = 0, ty = 0, cxp = 0, cyp = 0;
  $("#home").addEventListener("mousemove", e => {
    tx = (e.clientX / innerWidth - .5); ty = (e.clientY / innerHeight - .5);
  });
  $("#home").addEventListener("mouseleave", () => { tx = ty = 0; });
  (function par() {
    cxp += (tx - cxp) * .07; cyp += (ty - cyp) * .07;
    layers.forEach(l => { const d = +l.dataset.depth; l.style.translate = `${cxp * d * 2}px ${cyp * d * 1.4}px`; });
    portrait.style.rotate = (cxp * 2.2) + "deg";
    requestAnimationFrame(par);
  })();
}

/* ---------- Custom cursor + magnetic buttons ---------- */
if (fine) {
  document.body.classList.add("has-cursor");
  const cur = $("#cursor"), dot = $("#cursorDot");
  let mx = 0, my = 0, rx = 0, ry = 0;
  addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; });
  (function loop() { rx += (mx - rx) * .16; ry += (my - ry) * .16; cur.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
  $$("a,button,.tile,.cert-card,.f").forEach(el => { el.addEventListener("mouseenter", () => cur.classList.add("big")); el.addEventListener("mouseleave", () => cur.classList.remove("big")); });
  $$(".magnetic").forEach(b => {
    b.addEventListener("mousemove", e => { const r = b.getBoundingClientRect(); b.style.translate = `${(e.clientX - r.left - r.width / 2) * .25}px ${(e.clientY - r.top - r.height / 2) * .35}px`; });
    b.addEventListener("mouseleave", () => b.style.translate = "0 0");
  });
}

/* ---------- Tilt + spotlight ---------- */
$$(".tilt").forEach(c => {
  c.addEventListener("mousemove", e => {
    const b = c.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    c.style.setProperty("--mx", x + "px"); c.style.setProperty("--my", y + "px");
    c.style.transform = `perspective(900px) rotateX(${((y / b.height) - .5) * -9}deg) rotateY(${((x / b.width) - .5) * 9}deg) translateY(-6px)`;
  });
  c.addEventListener("mouseleave", () => c.style.transform = "");
});
$$(".win").forEach(c => c.addEventListener("mousemove", e => {
  const b = c.getBoundingClientRect(); c.style.setProperty("--mx", e.clientX - b.left + "px"); c.style.setProperty("--my", e.clientY - b.top + "px");
}));

/* ---------- Skill filters ---------- */
$$(".f").forEach(btn => btn.addEventListener("click", () => {
  $$(".f").forEach(b => b.classList.remove("active")); btn.classList.add("active");
  const f = btn.dataset.f;
  $$(".tile").forEach((t, i) => {
    const show = f === "all" || t.dataset.cat.split(" ").includes(f);
    t.classList.toggle("hide", !show);
    if (show) { t.style.opacity = 0; t.style.transform = "translateY(20px) scale(.95)"; setTimeout(() => { t.style.opacity = 1; t.style.transform = ""; }, 40 + i * 25); }
  });
}));

/* ---------- Logo fallback (if the icon CDN is unreachable) ---------- */
window.addEventListener("load", () => {
  $$('i[class*="devicon-"]').forEach(i => {
    const c = getComputedStyle(i, "::before").content;
    if (c && c !== "none" && c !== "normal" && c !== '""') return;
    const tile = i.closest(".tile");
    if (tile) {
      const m = document.createElement("div"); m.className = "mono"; m.textContent = tile.querySelector("b").textContent.slice(0, 2); i.replaceWith(m);
    } else { i.className = "fa-solid fa-cube"; }
  });
});

/* ---------- Terminal typing ---------- */
const termLines = [
  ["whoami", "Vishal Chandravanshi · Cloud & DevOps Engineer"],
  ["cat education.txt", "B.Tech CSE @ Lovely Professional University (Aug'23 – present)"],
  ["cat stack.txt", "AWS · Kubernetes · Docker · Terraform · ArgoCD · GitHub Actions\nPrometheus · Grafana · Alertmanager · Linux · Bash · Python · C++"],
  ["ls certifications/", "aws-solutions-architect-associate/   oracle-data-platform-2025/\nalibaba-clickhouse/   nptel-iot/"],
  ["ls projects/", "gitship/   cloud-observability-stack/   ai-deadlock-detection/"],
  ["echo $STATUS", "Open to opportunities → let's talk: vishalchandravanshi59@gmail.com"]
];
const term = $("#term"); let termStarted = false;
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
async function runTerm() {
  let html = "";
  const render = (extra = "") => term.innerHTML = html + extra + '<span class="cur"></span>';
  for (const [cmd, out] of termLines) {
    const prompt = '<span class="p">vishal@devops</span>:<span class="c">~</span>$ ';
    for (let i = 0; i <= cmd.length; i++) { render(prompt + esc(cmd.slice(0, i))); await new Promise(r => setTimeout(r, 38)); }
    html += prompt + esc(cmd) + "\n"; await new Promise(r => setTimeout(r, 260));
    html += '<span class="o">' + esc(out) + "</span>\n"; render(); await new Promise(r => setTimeout(r, 520));
  }
  html += '<span class="p">vishal@devops</span>:<span class="c">~</span>$ '; render();
}
new IntersectionObserver((es, o) => { if (es[0].isIntersecting && !termStarted) { termStarted = true; runTerm(); o.disconnect(); } }, { threshold: .35 }).observe($(".terminal"));

/* ---------- Lightbox ---------- */
const lb = $("#lightbox"), lbImg = $("img", lb);
const openLB = src => { lbImg.src = src; lb.classList.add("open"); };
lb.addEventListener("click", () => lb.classList.remove("open"));
addEventListener("keydown", e => e.key === "Escape" && lb.classList.remove("open"));

/* ---------- Load certificate + project images if present ---------- */
const exts = ["jpg", "jpeg", "png", "webp"];
function tryLoad(base, ok) {
  let i = 0;
  (function next() {
    if (i >= exts.length) return;
    const img = new Image(); const src = `${base}.${exts[i++]}`;
    img.onload = () => ok(src, img); img.onerror = next; img.src = src;
  })();
}
$$("[data-cert]").forEach(card => tryLoad("certs/" + card.dataset.cert, (src, img) => {
  const box = $(".cert-img", card); box.innerHTML = ""; img.alt = $("h4", card).textContent; box.appendChild(img);
  card.classList.add("has-img"); card.addEventListener("click", () => openLB(src));
}));
$$("[data-shot]").forEach(box => tryLoad("images/projects/" + box.dataset.shot, (src, img) => {
  img.alt = "Project screenshot"; box.appendChild(img); img.addEventListener("click", () => openLB(src));
}));

/* ---------- Contact form → mailto ---------- */
$("#form").addEventListener("submit", e => {
  e.preventDefault();
  const n = $("#fn").value.trim(), em = $("#fe").value.trim(), m = $("#fm").value.trim();
  const subject = encodeURIComponent("Portfolio enquiry from " + n);
  const body = encodeURIComponent(`${m}\n\n— ${n}\n${em}`);
  location.href = `mailto:vishalchandravanshi59@gmail.com?subject=${subject}&body=${body}`;
});

$("#year").textContent = new Date().getFullYear();
