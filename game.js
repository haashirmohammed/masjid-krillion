(function () {
  const P = window.PROMPTS, S = window.STAGES, SECONDS = 25;
  const TIER = { 10: "Everyone's answer", 30: "Well known", 60: "Uncommon", 85: "Rare", 100: "Hidden gem" };
  const $ = (id) => document.getElementById(id);
  const scene = $("scene"), world = $("world"), me = $("me");

  // ---- camera: a small window held tight on the cat ----
  const ZOOM = 2.6;
  scene.style.cssText = "width:min(720px,calc(100% - 32px));margin:16px auto 0;border:1px solid var(--line);border-radius:14px";
  world.style.transformOrigin = "0 0";
  world.style.overflow = "visible";

  // ---- the cat: an 8-bit orange tabby, one rect per pixel ----
  const CAT = [
    "..........O...O.",
    "D.........OO.OO.",
    "O.........ODODO.",
    "O.........OOOOOO",
    "D.........OKOOKO",
    "O.ODODODOOOWWPWW",
    "OOODODODOOOOWWW.",
    ".OODODODOOOOO...",
    "..OOOOOOOOOO....",
    "..OWWWWWWOOO....",
    "..O.O....O.O....",
    "..W.W....W.W...."
  ];
  const INK = { O: "#e8913a", D: "#8f4a17", W: "#f7e9cf", K: "#1b1404", P: "#f2a0a8" }, U = 2.5;
  let s = `<ellipse cx="0" cy="0" rx="19" ry="2.5" fill="#000" opacity=".3"/><g shape-rendering="crispEdges">`;
  CAT.forEach((row, r) => [...row].forEach((ch, c) => {
    if (INK[ch]) s += `<rect x="${(c - 8) * U}" y="${(r - 12) * U}" width="${U + 0.05}" height="${U + 0.05}" fill="${INK[ch]}"/>`;
  }));
  me.innerHTML = s + "</g>";

  // ---- scenery drawn by loop ----
  s = `<rect x="-800" y="262" width="800" height="38" fill="#070d24"/><rect x="1600" y="262" width="800" height="38" fill="#070d24"/>`;
  for (let i = 0; i < 46; i++) s += `<circle cx="${(i * 197) % 1600}" cy="${8 + (i * 59) % 130}" r="${i % 5 ? 0.9 : 1.5}" opacity="${0.35 + (i % 4) * 0.15}"/>`;
  for (let i = 0; i < 14; i++) s += `<circle cx="${-250 + (i * 83) % 410}" cy="${150 + (i * 37) % 90}" r="${i % 3 ? 0.5 : 0.8}" opacity="${0.4 + (i % 3) * 0.2}"/>`;
  $("stars").innerHTML = s;
  s = "";
  for (let i = 0; i < 3; i++) {
    const x = 650 + i * 50;
    s += `<path d="M${x} 192 q25 -30 50 0z" fill="#6f8fb5"/><rect x="${x - 2}" y="200" width="5" height="62" fill="#e6dfcc"/>` +
         `<path d="M${x} 232 a25 26 0 0 1 50 0" fill="none" stroke="#e6dfcc" stroke-width="3"/>`;
  }
  $("portico").innerHTML = s + `<rect x="646" y="192" width="158" height="9" fill="#e6dfcc"/>`;
  s = `<ellipse cx="1160" cy="150" rx="210" ry="80" fill="#f2c14e" opacity=".07"/>`;
  [1040, 1100, 1160, 1220, 1280].forEach((x, i) => {
    const top = 62 + Math.abs(i - 2) * 9;
    s += `<path d="M${x} ${top} V186" stroke="#8c7a4a" stroke-width="1"/><circle cx="${x}" cy="190" r="10" fill="#f2c14e" opacity=".18"/><circle cx="${x}" cy="190" r="4" fill="#f2c14e"/>`;
  });
  [990, 1050, 1110, 1230, 1290, 1350, 1410].forEach((x) => {
    s += `<g transform="translate(${x},254)" fill="#7b72b3"><circle cy="-34" r="6"/><path d="M-7 0 V-21 q7 -8 14 0 V0z"/></g>`;
  });
  $("hall").innerHTML = s;
  $("track").innerHTML = S.map(() => "<li></li>").join("");

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
  let scores, said, order, pos, timer, left, revealed;
  const total = () => scores.reduce((x, y) => x + y, 0);
  const stage = () => Math.min(7, Math.floor(total() / 100));

  function place() {
    const st = S[stage()], k = scene.clientHeight / 300 * ZOOM, gy = stage() >= 5 ? 254 : 262;
    world.style.transform = `translate(${scene.clientWidth / 2 - st[1] * k}px,${scene.clientHeight * 0.86 - gy * k}px) scale(${ZOOM})`;
    me.style.transform = `translate(${st[1]}px,${gy}px)`;
    $("stage").textContent = st[0];
    $("pts").textContent = total();
    [...$("track").children].forEach((li, i) => li.classList.toggle("on", i <= stage()));
  }
  function show(id) { ["start", "play", "end"].forEach((x) => ($(x).hidden = x !== id)); }

  function reset() { scores = P.map(() => 0); said = P.map(() => ""); revealed = false; place(); }
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
    $("fb").textContent = hit ? `${TIER[hit[0]]}. ${hit[1]} is worth ${hit[0]} points.` : msg;
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
    $("verdict").textContent = t === 700 ? "Front row. A perfect 700." : `You made it: ${S[stage()][0].toLowerCase()}.`;
    $("summary").textContent = t === 700 ? "Seven hidden gems out of seven. Take your place by the mihrab."
      : `${t} of 700 points. ${700 - t} more would put you in the front row.`;
    $("rows").innerHTML = P.map((p, i) => {
      const gems = p.a.filter((a) => a[0] === 100).map((a) => a[1]).join(", ");
      const cell = scores[i] || revealed ? gems : "Retry it to reveal";
      return `<tr><td>${p.q}</td><td>${said[i] ? esc(said[i]) : "No answer"}</td><td class="n">${scores[i]}</td><td>${cell}</td></tr>`;
    }).join("");
    $("retry").hidden = !missed.length;
    $("retry").textContent = `Retry the ${missed.length} you missed`;
    $("retry").onclick = () => { revealed = true; round(missed); };
    show("end");
  }
  const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  $("begin").addEventListener("click", () => round(P.map((_, i) => i)));
  $("again").addEventListener("click", () => { reset(); round(P.map((_, i) => i)); });
  window.addEventListener("resize", place);
  reset();
})();
