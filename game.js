(function () {
  const P = window.PROMPTS, STAGE = window.STAGES, TIERS = window.TIERS, SECONDS = 25;
  const $ = (id) => document.getElementById(id);
  const scene = $("scene"), world = $("world"), panel = $("float");

  // ---- the route: every point is 4.4 world units, so each 100 points is one 440-unit section ----
  const X0 = 120, STEP = 4.4, GROUND = 262, CARPET = 254, TOP = -700, DEEP = 500;
  const GATE = X0 + 100 * STEP, FOUNT = X0 + 250 * STEP, PORT = X0 + 300 * STEP, DOOR = X0 + 400 * STEP, QIBLA = X0 + 700 * STEP + 62;
  const C = { stone: "#e6dfcc", lead: "#6f8fb5", tile: "#27b3ad", lamp: "#f2c14e", carpet: "#a8323a", hall: "#2a2350", street: "#070d24", paving: "#1b2a55" };
  const lamp = (x, y) => `<circle cx="${x}" cy="${y}" r="11" fill="${C.lamp}" opacity=".18"/><circle cx="${x}" cy="${y}" r="4" fill="${C.lamp}"/>`;

  // outside: a sky full of stars, a crescent moon, street lamps, palms
  let w = `<rect x="-900" y="${GROUND}" width="5200" height="${DEEP}" fill="${C.street}"/>`;
  for (let i = 0; i < 170; i++) w = `<circle cx="${-500 + (i * 197) % 4300}" cy="${-420 + (i * 131) % 660}" r="${i % 4 ? 0.6 : 1}" fill="#f3efe4" opacity="${0.35 + (i % 3) * 0.2}"/>` + w;
  w = `<path d="M10 113 a22 22 0 1 0 22 22 a17.5 17.5 0 1 1 -22 -22z" fill="${C.lamp}"/>` + w;
  [170, 430].forEach((x) => { w += `<rect x="${x - 1.5}" y="198" width="3" height="64" fill="#3a4470"/>` + lamp(x, 194); });
  [20, 300].forEach((x) => {
    w += `<rect x="${x - 3}" y="192" width="6" height="70" fill="#4a3b2a"/>`;
    [[-22, -14, -40, 4], [22, -14, 40, 4], [-12, -24, -30, -18], [12, -24, 30, -18]].forEach((f) => {
      w += `<path d="M${x} 192 q${f[0]} ${f[1]} ${f[2]} ${f[3]}" fill="none" stroke="#2f6b4f" stroke-width="4" stroke-linecap="round"/>`;
    });
  });

  // gate in the outer wall: the cat stands in the gateway at exactly 100 points
  w += [0, 28, 56, 84].map((dx) => `<rect x="${GATE - 40 + dx}" y="98" width="16" height="12" fill="${C.stone}"/>`).join("") +
       `<rect x="${GATE - 40}" y="110" width="100" height="${GROUND - 110}" fill="${C.stone}"/>` +
       `<path d="M${GATE - 25} ${GROUND} V214 a25 28 0 0 1 50 0 V${GROUND}z" fill="#101c40"/>` +
       `<path d="M${GATE - 25} 214 a25 28 0 0 1 50 0" fill="none" stroke="${C.tile}" stroke-width="3"/>`;

  // courtyard: paving, low back wall with niches, cypresses, ablution fountain
  w += `<rect x="${GATE - 25}" y="${GROUND}" width="${DOOR - GATE + 25}" height="${DEEP}" fill="${C.paving}"/>` +
       `<rect x="${GATE + 60}" y="206" width="${PORT - GATE - 60}" height="56" fill="#5d5a66" opacity=".45"/>`;
  for (let x = GATE + 110; x < PORT - 40; x += 100) w += `<path d="M${x} ${GROUND} V232 a14 16 0 0 1 28 0 V${GROUND}z" fill="#101c40" opacity=".55"/>`;
  [GATE + 260, FOUNT - 150, FOUNT + 150].forEach((x) => { w += `<rect x="${x - 2}" y="244" width="4" height="18" fill="#4a3b2a"/><ellipse cx="${x}" cy="212" rx="9" ry="42" fill="#1f5a45"/>`; });
  w += `<path d="M${FOUNT - 36} 228 q36 -38 72 0z" fill="${C.lead}"/><rect x="${FOUNT - 1}" y="198" width="2" height="12" fill="${C.lamp}"/>` +
       `<rect x="${FOUNT - 28}" y="228" width="56" height="34" fill="${C.stone}"/><rect x="${FOUNT - 16}" y="238" width="32" height="24" fill="${C.tile}" opacity=".7"/>`;

  // portico: eight bays under small lead domes
  w += `<rect x="${PORT}" y="200" width="${DOOR - PORT}" height="62" fill="#141f47"/>`;
  for (let i = 0; i < 8; i++) {
    const x = PORT + i * 55;
    w += `<path d="M${x} 190 q27.5 -28 55 0z" fill="${C.lead}"/><path d="M${x} 232 a27.5 28 0 0 1 55 0" fill="none" stroke="${C.stone}" stroke-width="3"/>` +
         `<rect x="${x - 2.5}" y="200" width="5" height="62" fill="${C.stone}"/>`;
  }
  w += `<rect x="${PORT - 4}" y="190" width="${DOOR - PORT + 4}" height="10" fill="${C.stone}"/>`;

  // prayer hall: door wall, lamps, windows, carpet, rows of worshippers, mihrab on the qibla wall
  w += `<rect x="${DOOR + 12}" y="${TOP}" width="${QIBLA - DOOR - 12}" height="${GROUND - TOP}" fill="${C.hall}"/>` +
       `<rect x="${DOOR}" y="${TOP}" width="12" height="${214 - TOP}" fill="${C.stone}"/><rect x="${DOOR}" y="214" width="12" height="48" fill="${C.hall}"/>` +
       `<rect x="${DOOR}" y="212" width="12" height="3" fill="${C.tile}"/>` +
       `<rect x="${DOOR + 12}" y="198" width="${QIBLA - DOOR - 12}" height="3" fill="${C.tile}" opacity=".45"/>` +
       `<rect x="${DOOR}" y="${CARPET}" width="${QIBLA - DOOR}" height="8" fill="${C.carpet}"/>` +
       `<rect x="${QIBLA}" y="${TOP}" width="30" height="${GROUND - TOP}" fill="${C.stone}"/>`;
  for (let x = DOOR + 80; x < QIBLA - 40; x += 110) {
    w += `<path d="M${x} ${TOP} V186" stroke="#8c7a4a" stroke-width="1"/>` + lamp(x, 190) +
         `<path d="M${x + 44} 244 V220 a11 13 0 0 1 22 0 V244z" fill="#1a1640" stroke="${C.lead}" stroke-width="1.5" opacity=".8"/>` +
         `<path d="M${x + 35} 172 V118 a20 22 0 0 1 40 0 V172z" fill="#1a1640" stroke="${C.lead}" stroke-width="1.5" opacity=".7"/>`;
  }
  for (let x = DOOR + 500; x <= QIBLA - 100; x += 78) w += `<g transform="translate(${x},${CARPET})" fill="#7b72b3"><circle cy="-34" r="6"/><path d="M-7 0 V-21 q7 -8 14 0 V0z"/></g>`;
  w += `<path d="M${QIBLA} ${GROUND} V196 q-20 -16 -22 14 V${GROUND}z" fill="${C.tile}"/><path d="M${QIBLA} ${GROUND} V208 q-12 -8 -13 8 V${GROUND}z" fill="#0f7f86"/>`;

  // ---- the cat: an 8-bit orange tabby, one rect per pixel, two leg frames for walking ----
  const BODY = [
    "..........O...O.",
    "D.........OO.OO.",
    "O.........ODODO.",
    "O.........OOOOOO",
    "D.........OKOOKO",
    "O.ODODODOOOWWPWW",
    "OOODODODOOOOWWW.",
    ".OODODODOOOOO...",
    "..OOOOOOOOOO....",
    "..OWWWWWWOOO...."
  ];
  const LEGS = [["..O.O....O.O....", "..W.W....W.W...."], ["...O.O..O.O.....", "...W.W..W.W....."]];
  const INK = { O: "#e8913a", D: "#8f4a17", W: "#f7e9cf", K: "#1b1404", P: "#f2a0a8" }, U = 2.5;
  const px = (rows, r0) => rows.map((row, r) => [...row].map((ch, c) => INK[ch]
    ? `<rect x="${(c - 8) * U}" y="${(r0 + r - 12) * U}" width="${U + 0.05}" height="${U + 0.05}" fill="${INK[ch]}"/>` : "").join("")).join("");
  w += `<g id="me"><ellipse cx="0" cy="0" rx="19" ry="2.5" fill="#000" opacity=".3"/><g shape-rendering="crispEdges">${px(BODY, 0)}` +
       `<g id="legsA">${px(LEGS[0], 10)}</g><g id="legsB" style="display:none">${px(LEGS[1], 10)}</g></g></g>`;
  world.innerHTML = w;
  const me = $("me"), legs = [$("legsA"), $("legsB")];
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- tiers, named after the five pillars ----
  $("tiers").innerHTML = TIERS.map((t) => `<li title="${t[2]}"><b>${t[1]}</b>${t[0]}</li>`).join("");
  const tier = (pts) => TIERS.find((t) => t[0] === pts)[1];
  $("track").innerHTML = STAGE.map(() => "<li></li>").join("");

  // ---- answer matching ----
  const norm = (t) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/['’`ʿʾ]/g, "").replace(/-/g, " ")
    .replace(/\bbin\b/g, "ibn")
    .replace(/\b(the|al|an|as|at|ar|ash|az|ad|imam|sultan|battle|of|ghazwa|ghazwat|surah|surat|sahih|sunan|jami|hazrat|prophet|banu|bani|[ivx]+)\b/g, " ")
    .replace(/[^a-z]/g, "");
  function lev(a, b) {
    let row = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      let prev = row[0]; row[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const tmp = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = tmp;
      }
    }
    return row[b.length];
  }
  function match(prompt, text) {
    const t = norm(text);
    if (!t) return null;
    for (const a of prompt.a) if (a.slice(2).some((x) => norm(x) === t)) return a;
    if (t.length < 4) return null;
    for (const a of prompt.a) for (const x of a.slice(2)) {
      const n = norm(x);
      if (n.length >= 5 && lev(n, t) <= (n.length >= 9 ? 2 : 1)) return a;
    }
    return null;
  }

  // ---- state ----
  let scores, said, order, pos, timer, left, revealed, lastX = 0, walk;
  const total = () => scores.reduce((x, y) => x + y, 0);
  const stage = () => Math.min(7, Math.floor(total() / 100));

  // Move the cat to where the score puts it and keep the camera on it. snap = no walking.
  function place(snap) {
    const x = X0 + total() * STEP, gy = x > DOOR + 6 ? CARPET : GROUND, W = scene.clientWidth, H = scene.clientHeight;
    const s = Math.max(2.4, Math.min(4.2, H / 200, W / 150)), floor = H * 0.86;
    const d = snap ? 0 : Math.abs(x - lastX), secs = d ? 0.9 + d / 400 : 0;
    lastX = x;
    panel.style.maxHeight = Math.max(220, floor - 30 * s - 44) + "px";
    world.style.transitionDuration = me.style.transitionDuration = secs + "s";
    world.style.transform = `translate(${W / 2 - x * s}px,${floor - gy * s}px) scale(${s})`;
    me.style.transform = `translate(${x}px,${gy}px)`;
    const frame = (f) => { legs[0].style.display = f ? "none" : ""; legs[1].style.display = f ? "" : "none"; };
    clearInterval(walk); frame(0);
    if (d && !still) {
      let f = 0, n = Math.round(secs * 1000 / 140);
      walk = setInterval(() => { f ^= 1; frame(f); if (!--n) { clearInterval(walk); frame(0); } }, 140);
    }
    $("stage").textContent = STAGE[stage()];
    $("pts").textContent = total();
    [...$("track").children].forEach((li, i) => li.classList.toggle("on", i <= stage()));
  }
  function show(id) { ["start", "play", "end"].forEach((x) => ($(x).hidden = x !== id)); }

  function reset() { scores = P.map(() => 0); said = P.map(() => ""); revealed = false; place(true); }
  function round(list) { order = list; pos = 0; show("play"); ask(); }

  function ask() {
    const p = P[order[pos]];
    $("tag").textContent = `${p.tag} · ${pos + 1} of ${order.length}`;
    $("q").textContent = p.q; $("hint").textContent = p.hint;
    $("fb").textContent = ""; $("fb").className = "";
    $("form").hidden = false; $("next").hidden = true;
    $("ans").value = ""; $("ans").focus();
    left = SECONDS * 10; tick();
    clearInterval(timer); timer = setInterval(() => { left--; tick(); if (left <= 0) settle(null, "Time is up. No points for this one."); }, 100);
  }
  function tick() { const b = $("time"); b.style.width = Math.max(0, left / (SECONDS * 10) * 100) + "%"; b.classList.toggle("low", left < 70); }

  function settle(hit, msg) {
    clearInterval(timer);
    const i = order[pos];
    scores[i] = hit ? hit[0] : 0;
    if (hit) said[i] = hit[1];
    $("fb").className = hit ? "ok" : "no";
    $("fb").textContent = hit ? `${tier(hit[0])}: ${hit[1]}, +${hit[0]} points.` : msg;
    $("form").hidden = true;
    $("next").hidden = false;
    $("next").textContent = pos + 1 < order.length ? "Next prompt" : "See how far you got";
    $("next").focus();
    place();
  }

  $("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const text = $("ans").value.trim();
    if (!text) return;
    const hit = match(P[order[pos]], text);
    if (hit) return settle(hit);
    said[order[pos]] = text;
    $("fb").className = "no";
    $("fb").textContent = `"${text}" isn't on the list. Try another while the clock runs.`;
    $("ans").select();
  });
  $("skip").addEventListener("click", () => settle(null, "Skipped. No points for this one."));
  $("next").addEventListener("click", () => { if (++pos < order.length) ask(); else finish(); });

  function finish() {
    const t = total(), missed = P.map((_, i) => i).filter((i) => !scores[i]);
    if (!missed.length) revealed = true;
    $("verdict").textContent = t === 700 ? "Front row. A perfect 700." : `You made it: ${STAGE[stage()].toLowerCase()}.`;
    $("summary").textContent = t === 700 ? "Seven Hajj answers out of seven. Take your place by the mihrab."
      : `${t} of 700 points. ${700 - t} more would put you in the front row.`;
    $("rows").innerHTML = P.map((p, i) => {
      const top = p.a.filter((a) => a[0] === 100).map((a) => a[1]).join(", ");
      const cell = scores[i] || revealed ? top : "Retry it to reveal";
      const pts = scores[i] ? `${scores[i]} · ${tier(scores[i])}` : "0";
      return `<tr><td>${p.q}</td><td>${said[i] ? esc(said[i]) : "No answer"}</td><td class="n">${pts}</td><td>${cell}</td></tr>`;
    }).join("");
    $("retry").hidden = !missed.length;
    $("retry").textContent = `Retry the ${missed.length} you missed`;
    $("retry").onclick = () => { revealed = true; round(missed); };
    show("end");
  }
  const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  $("begin").addEventListener("click", () => round(P.map((_, i) => i)));
  $("again").addEventListener("click", () => { reset(); round(P.map((_, i) => i)); });
  window.addEventListener("resize", () => place(true));
  reset();
})();
