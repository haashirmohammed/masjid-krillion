(function () {
  const P = window.PROMPTS, STAGE = window.STAGES, TIERS = window.TIERS, SECONDS = 25;
  const $ = (id) => document.getElementById(id);
  const scene = $("scene"), world = $("world"), fx = $("fx");
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  let seed = 11;
  const pr = () => (seed = (seed * 9301 + 49297) % 233280) / 233280; // fixed scenery, same every load

  // ---- the route: every point is 4.4 world units, so each 100 points is one 440-unit section ----
  const X0 = 120, STEP = 4.4, GROUND = 262, CARPET = 254, TOP = -700, DEEP = 500;
  const GATE = X0 + 100 * STEP, FOUNT = X0 + 250 * STEP, PORT = X0 + 300 * STEP, DOOR = X0 + 400 * STEP, QIBLA = X0 + 700 * STEP + 62;
  const C = { stone: "#e6dfcc", lead: "#6f8fb5", tile: "#27b3ad", lamp: "#f2c14e", gold: "#d9a441", carpet: "#a8323a", hall: "#2a2350", street: "#070d24", wood: "#6b4a2a", ink: "#f3efe4" };
  const lamp = (x, y) => `<circle cx="${x}" cy="${y}" r="11" fill="${C.lamp}" opacity=".18"/><circle cx="${x}" cy="${y}" r="4" fill="${C.lamp}"/>`;
  const lantern = (x, y) => `<rect x="${x - 0.5}" y="${y - 12}" width="1" height="12" fill="#8c7a4a"/><circle cx="${x}" cy="${y + 4}" r="9" fill="${C.lamp}" opacity=".16"/>` +
    `<rect x="${x - 3}" y="${y}" width="6" height="8" fill="${C.lamp}"/><rect x="${x - 4}" y="${y - 1}" width="8" height="2" fill="${C.gold}"/><rect x="${x - 2}" y="${y + 8}" width="4" height="2" fill="${C.gold}"/>`;

  // ---- tile patterns ----
  let w = `<defs>
    <pattern id="tiles" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#123a5a"/><path d="M8 1 L15 8 L8 15 L1 8z" fill="#1f6f86"/><path d="M8 4 L12 8 L8 12 L4 8z" fill="#27b3ad"/><rect x="7" y="7" width="2" height="2" fill="#f2c14e"/><rect width="2" height="2" fill="#f2c14e" opacity=".6"/></pattern>
    <pattern id="tiles2" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#1c2d63"/><path d="M6 0 L12 6 L6 12 L0 6z" fill="none" stroke="#3d74a8" stroke-width="1"/><rect x="5" y="5" width="2" height="2" fill="#27b3ad"/></pattern>
    <pattern id="pave" width="24" height="12" patternUnits="userSpaceOnUse"><rect width="24" height="12" fill="#1b2a55"/><path d="M0 .5 H24 M.5 0 V6 M12.5 6 V12 M0 6.5 H24" stroke="#273a72" stroke-width="1"/></pattern>
    <pattern id="walk" width="12" height="8" patternUnits="userSpaceOnUse"><rect width="12" height="8" fill="#141d42"/><path d="M0 .5 H12 M.5 0 V8" stroke="#202b5a"/></pattern>
    <pattern id="rug" width="40" height="30" patternUnits="userSpaceOnUse"><rect width="40" height="30" fill="#8f2731"/><rect x="2" y="2" width="36" height="26" fill="none" stroke="#6b1a23" stroke-width="2"/><path d="M8 27 V12 Q20 1 32 12 V27" fill="none" stroke="#d9a441" stroke-width="1.5"/><rect x="18" y="16" width="4" height="4" fill="#d9a441" opacity=".7"/></pattern>
    <pattern id="glass" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#27b3ad"/><rect x="3" width="3" height="3" fill="#f2c14e" opacity=".8"/><rect y="3" width="3" height="3" fill="#a8323a"/><rect x="3" y="3" width="3" height="3" fill="#3d74a8"/></pattern>
  </defs>`;

  // ---- sky: pixel stars (some twinkle), crescent moon, pixel clouds ----
  w += `<rect x="-900" y="${GROUND}" width="5200" height="${DEEP}" fill="${C.street}"/><g fill="${C.ink}">`;
  for (let i = 0; i < 220; i++) {
    const tw = i % 6 === 0 ? ` class="tw" style="animation-delay:${(i % 17) * 0.23}s"` : "";
    w += `<rect x="${-500 + (i * 197) % 4300}" y="${-420 + (i * 131) % 660}" width="${i % 5 ? 1.2 : 2}" height="${i % 5 ? 1.2 : 2}" opacity="${0.35 + (i % 3) * 0.2}"${tw}/>`;
  }
  w += `</g><path d="M10 113 a22 22 0 1 0 22 22 a17.5 17.5 0 1 1 -22 -22z" fill="${C.lamp}"/>`;
  [[-260, 66], [120, 40], [430, 74], [760, 52], [1150, 30], [1500, 64]].forEach(([x, y]) => {
    w += `<g fill="#2a3470" opacity=".6"><rect x="${x}" y="${y}" width="92" height="8"/><rect x="${x + 14}" y="${y - 6}" width="52" height="6"/><rect x="${x + 30}" y="${y - 11}" width="22" height="5"/></g>`;
  });

  // ---- distant city skyline with lit windows ----
  for (let x = -480; x < PORT - 80;) {
    const tall = x < GATE - 40 ? 1 : 0.45, bw = 24 + Math.floor(pr() * 30), bh = Math.floor((40 + pr() * 95) * tall);
    w += `<rect x="${x}" y="${GROUND - bh}" width="${bw}" height="${bh}" fill="#111839"/>`;
    for (let wy = GROUND - bh + 6; wy < GROUND - 14; wy += 9) {
      for (let wx = x + 4; wx < x + bw - 5; wx += 7) if (pr() < 0.25) w += `<rect x="${wx}" y="${wy}" width="3" height="4" fill="${pr() < 0.8 ? C.lamp : C.tile}" opacity=".42"/>`;
    }
    if (pr() < 0.35) w += `<rect x="${x + bw / 2 - 1}" y="${GROUND - bh - 14}" width="2" height="14" fill="#141c45"/><rect x="${x + bw / 2 - 1.5}" y="${GROUND - bh - 17}" width="3" height="3" fill="#ef7d6f" class="tw"/>`;
    x += bw + 4 + Math.floor(pr() * 10);
  }

  // ---- street: tiled sidewalk, curb, dashed road, palms, lamps, a bench ----
  w += `<rect x="-900" y="${GROUND}" width="${GATE - 15 + 900}" height="10" fill="url(#walk)"/><rect x="-900" y="${GROUND + 10}" width="${GATE - 15 + 900}" height="2" fill="#2b3566"/>`;
  for (let x = -890; x < GATE - 40; x += 34) w += `<rect x="${x}" y="${GROUND + 34}" width="14" height="2" fill="#3a4470"/>`;
  [170, 430].forEach((x) => { w += `<rect x="${x - 1.5}" y="198" width="3" height="64" fill="#3a4470"/><rect x="${x - 4}" y="196" width="8" height="2" fill="#3a4470"/>` + lamp(x, 194); });
  [20, 300].forEach((x) => {
    for (let y = 194; y < 262; y += 6) w += `<rect x="${x - 3}" y="${y}" width="6" height="5" fill="${y % 12 ? "#4a3b2a" : "#3d2f21"}"/>`;
    [[-22, -14, -40, 4], [22, -14, 40, 4], [-12, -24, -30, -18], [12, -24, 30, -18], [0, -26, -4, -30]].forEach((f) => {
      w += `<path d="M${x} 192 q${f[0]} ${f[1]} ${f[2]} ${f[3]}" fill="none" stroke="#2f6b4f" stroke-width="4" stroke-linecap="square"/>`;
    });
    w += `<rect x="${x - 5}" y="193" width="4" height="4" fill="#7a5530"/><rect x="${x + 1}" y="194" width="4" height="4" fill="#7a5530"/>`;
  });
  w += `<rect x="226" y="249" width="34" height="3" fill="${C.wood}"/><rect x="226" y="242" width="34" height="2" fill="${C.wood}"/><rect x="229" y="252" width="2" height="10" fill="#3a4470"/><rect x="255" y="252" width="2" height="10" fill="#3a4470"/>`;

  // ---- minaret and main dome rising behind the courtyard ----
  const MX = FOUNT + 70;
  w += `<rect x="${MX - 8}" y="-120" width="16" height="330" fill="#cfc7b2"/><rect x="${MX - 13}" y="20" width="26" height="6" fill="#bdb49d"/><rect x="${MX - 13}" y="-60" width="26" height="6" fill="#bdb49d"/>` +
       `<rect x="${MX - 2}" y="40" width="4" height="10" fill="#1a1640"/><rect x="${MX - 2}" y="-40" width="4" height="10" fill="#1a1640"/><path d="M${MX - 8} -120 L${MX} -168 L${MX + 8} -120z" fill="${C.lead}"/><rect x="${MX - 1}" y="-180" width="2" height="12" fill="${C.lamp}"/>`;
  w += `<path d="M${PORT + 60} 190 A170 78 0 0 1 ${PORT + 400} 190z" fill="#50709d"/><path d="M${PORT - 30} 190 A60 34 0 0 1 ${PORT + 90} 190z M${PORT + 370} 190 A60 34 0 0 1 ${PORT + 490} 190z" fill="#5d7fae"/>` +
       `<rect x="${PORT + 229}" y="96" width="2" height="16" fill="${C.lamp}"/><rect x="${PORT + 226}" y="92" width="8" height="4" fill="${C.lamp}"/>`;

  // ---- gate in the outer wall: crenels, tile panels, a lantern in the arch ----
  w += [0, 28, 56, 84].map((dx) => `<rect x="${GATE - 40 + dx}" y="98" width="16" height="12" fill="${C.stone}"/>`).join("") +
       `<rect x="${GATE - 40}" y="110" width="100" height="${GROUND - 110}" fill="${C.stone}"/>` +
       `<rect x="${GATE - 34}" y="118" width="88" height="14" fill="url(#tiles2)"/>` +
       `<rect x="${GATE - 36}" y="150" width="9" height="100" fill="url(#tiles)"/><rect x="${GATE + 47}" y="150" width="9" height="100" fill="url(#tiles)"/>` +
       `<path d="M${GATE - 25} ${GROUND} V214 a25 28 0 0 1 50 0 V${GROUND}z" fill="#101c40"/>` +
       `<path d="M${GATE - 29} ${GROUND} V214 a29 32 0 0 1 58 0 V${GROUND}" fill="none" stroke="${C.tile}" stroke-width="3"/>` +
       `<path d="M${GATE - 22} 186 a22 18 0 0 1 44 0" fill="none" stroke="${C.gold}" stroke-width="1.5"/>` + lantern(GATE, 206);

  // ---- courtyard: paving, tiled back wall with niches, cypresses, potted plants, fountain with jets, pigeons ----
  w += `<rect x="${GATE - 25}" y="${GROUND}" width="${DOOR - GATE + 25}" height="${DEEP}" fill="url(#pave)"/>` +
       `<rect x="${GATE + 60}" y="206" width="${PORT - GATE - 60}" height="56" fill="#5d5a66" opacity=".55"/>` +
       `<rect x="${GATE + 60}" y="206" width="${PORT - GATE - 60}" height="8" fill="url(#tiles2)"/>`;
  for (let x = GATE + 110; x < PORT - 40; x += 100) w += `<path d="M${x} ${GROUND} V232 a14 16 0 0 1 28 0 V${GROUND}z" fill="#101c40" opacity=".6"/><path d="M${x + 4} ${GROUND - 4} V234 a10 12 0 0 1 20 0 V${GROUND - 4}z" fill="url(#tiles)" opacity=".35"/>`;
  [GATE + 260, FOUNT - 150, FOUNT + 150].forEach((x) => {
    w += `<rect x="${x - 2}" y="244" width="4" height="18" fill="#4a3b2a"/><ellipse cx="${x}" cy="212" rx="9" ry="42" fill="#1f5a45"/><ellipse cx="${x - 3}" cy="206" rx="3" ry="28" fill="#2a7558"/>`;
  });
  [GATE + 120, GATE + 400, PORT - 70].forEach((x) => {
    w += `<rect x="${x - 6}" y="250" width="12" height="12" fill="#b0603a"/><rect x="${x - 7}" y="249" width="14" height="3" fill="#c8754a"/>` +
         `<rect x="${x - 8}" y="242" width="5" height="7" fill="#2f6b4f"/><rect x="${x - 2}" y="238" width="4" height="11" fill="#3b8a5f"/><rect x="${x + 3}" y="243" width="5" height="6" fill="#2f6b4f"/>`;
  });
  w += `<path d="M${FOUNT - 36} 228 q36 -38 72 0z" fill="${C.lead}"/><rect x="${FOUNT - 1}" y="198" width="2" height="12" fill="${C.lamp}"/>` +
       `<rect x="${FOUNT - 28}" y="228" width="56" height="34" fill="${C.stone}"/><rect x="${FOUNT - 16}" y="238" width="32" height="24" fill="${C.tile}" opacity=".7"/>` +
       `<rect x="${FOUNT - 34}" y="254" width="68" height="8" fill="#bdb49d"/><rect x="${FOUNT - 30}" y="252" width="60" height="3" fill="#9fe3ee" opacity=".8"/>` +
       `<g class="jets" fill="none" stroke="#9fe3ee" stroke-width="1.5" stroke-dasharray="3 2"><path d="M${FOUNT - 10} 246 q-10 -12 -18 6"/><path d="M${FOUNT + 10} 246 q10 -12 18 6"/></g>`;
  [FOUNT - 70, FOUNT - 58, FOUNT + 62].forEach((x, i) => {
    w += `<g fill="#9aa3b8"><rect x="${x}" y="256" width="7" height="4"/><rect x="${x + (i % 2 ? -2 : 6)}" y="254" width="3" height="3"/></g><rect x="${x + (i % 2 ? -3 : 8)}" y="255" width="1.5" height="1" fill="${C.lamp}"/>`;
  });

  // ---- portico: arched bays under small domes, a lantern in each bay, tiled dado, shoe rack by the door ----
  w += `<rect x="${PORT}" y="200" width="${DOOR - PORT}" height="62" fill="#141f47"/><rect x="${PORT}" y="238" width="${DOOR - PORT}" height="24" fill="url(#tiles2)"/>`;
  for (let i = 0; i < 8; i++) {
    const x = PORT + i * 55;
    w += `<path d="M${x} 190 q27.5 -28 55 0z" fill="${C.lead}"/><rect x="${x + 26.5}" y="166" width="2" height="9" fill="${C.lamp}"/>` +
         `<path d="M${x} 232 a27.5 28 0 0 1 55 0" fill="none" stroke="${C.stone}" stroke-width="3"/><path d="M${x + 4} 232 a23.5 24 0 0 1 47 0" fill="none" stroke="${C.carpet}" stroke-width="1" stroke-dasharray="3 3"/>` +
         `<rect x="${x - 2.5}" y="200" width="5" height="62" fill="${C.stone}"/><rect x="${x - 4}" y="200" width="8" height="3" fill="#bdb49d"/>` + lantern(x + 27.5, 214);
  }
  w += `<rect x="${PORT - 4}" y="190" width="${DOOR - PORT + 4}" height="10" fill="${C.stone}"/><rect x="${PORT - 4}" y="193" width="${DOOR - PORT + 4}" height="3" fill="url(#tiles2)"/>`;
  w += `<rect x="${DOOR - 48}" y="238" width="40" height="24" fill="#3d2b1f"/><rect x="${DOOR - 46}" y="248" width="36" height="1.5" fill="${C.wood}"/>`;
  ["#ef7d6f", "#27b3ad", "#f2c14e", "#f3efe4", "#3d74a8", "#a8323a"].forEach((c, i) => {
    w += `<rect x="${DOOR - 45 + (i % 3) * 12}" y="${i < 3 ? 243 : 255}" width="5" height="3" fill="${c}"/><rect x="${DOOR - 39 + (i % 3) * 12}" y="${i < 3 ? 243 : 255}" width="5" height="3" fill="${c}"/>`;
  });

  // ---- prayer hall: frieze, stained glass, pillars, chandeliers, tiled dado, patterned rug, bookcase, worshippers, minbar, mihrab ----
  w += `<rect x="${DOOR + 12}" y="${TOP}" width="${QIBLA - DOOR - 12}" height="${GROUND - TOP}" fill="${C.hall}"/>` +
       `<rect x="${DOOR}" y="${TOP}" width="12" height="${214 - TOP}" fill="${C.stone}"/><rect x="${DOOR}" y="214" width="12" height="48" fill="${C.hall}"/><rect x="${DOOR}" y="212" width="12" height="3" fill="${C.tile}"/>` +
       `<rect x="${DOOR + 12}" y="104" width="${QIBLA - DOOR - 12}" height="26" fill="#1d1840"/><rect x="${DOOR + 12}" y="104" width="${QIBLA - DOOR - 12}" height="2" fill="${C.gold}"/><rect x="${DOOR + 12}" y="128" width="${QIBLA - DOOR - 12}" height="2" fill="${C.gold}"/>`;
  for (let x = DOOR + 20; x < QIBLA - 20; x += 26) {
    w += `<path d="M${x} 122 q4 -9 8 0 t8 0 M${x + 19} 110 v13 M${x + 5} 112 h6" fill="none" stroke="${C.gold}" stroke-width="1.5"/><rect x="${x + 10}" y="114" width="1.5" height="1.5" fill="${C.gold}"/>`;
  }
  w += `<rect x="${DOOR + 12}" y="198" width="${QIBLA - DOOR - 12}" height="3" fill="${C.tile}" opacity=".45"/><rect x="${DOOR + 12}" y="214" width="${QIBLA - DOOR - 12}" height="40" fill="url(#tiles2)"/><rect x="${DOOR + 12}" y="213" width="${QIBLA - DOOR - 12}" height="2" fill="${C.gold}"/>`;
  for (let x = DOOR + 80; x < QIBLA - 40; x += 110) {
    w += `<path d="M${x} ${TOP} V186" stroke="#8c7a4a" stroke-width="1"/>` + lamp(x, 190) +
         `<path d="M${x + 44} 244 V220 a11 13 0 0 1 22 0 V244z" fill="#1a1640" stroke="${C.lead}" stroke-width="1.5" opacity=".9"/>` +
         `<path d="M${x + 35} 172 V146 a20 22 0 0 1 40 0 V172z" fill="url(#glass)" opacity=".75"/><path d="M${x + 35} 172 V146 a20 22 0 0 1 40 0 V172z M${x + 55} 124 V172 M${x + 35} 158 H${x + 75}" fill="none" stroke="${C.gold}" stroke-width="1.5"/>`;
  }
  for (let x = DOOR + 245; x < QIBLA - 120; x += 330) {
    w += `<rect x="${x - 6}" y="136" width="12" height="118" fill="${C.stone}"/><rect x="${x - 9}" y="132" width="18" height="6" fill="${C.gold}"/><rect x="${x - 9}" y="248" width="18" height="6" fill="#bdb49d"/><rect x="${x - 2}" y="140" width="4" height="104" fill="#cfc7b2"/>`;
  }
  for (let x = DOOR + 410; x < QIBLA - 60; x += 330) {
    w += `<path d="M${x} ${TOP} V82" stroke="#8c7a4a" stroke-width="1"/><ellipse cx="${x}" cy="92" rx="30" ry="6" fill="none" stroke="${C.gold}" stroke-width="2"/><ellipse cx="${x}" cy="92" rx="40" ry="14" fill="${C.lamp}" opacity=".08"/>`;
    for (let k = -3; k <= 3; k++) w += `<rect x="${x + k * 9 - 1.5}" y="${92 + Math.abs(k) * -0.6 - 4}" width="3" height="4" fill="${C.lamp}"/>`;
    w += `<path d="M${x - 30} 92 L${x} 80 L${x + 30} 92" fill="none" stroke="#8c7a4a" stroke-width="1"/>`;
  }
  w += `<rect x="${DOOR}" y="${CARPET}" width="${QIBLA - DOOR}" height="${DEEP}" fill="url(#rug)"/><rect x="${DOOR}" y="${CARPET}" width="${QIBLA - DOOR}" height="1.5" fill="${C.gold}"/>`;
  w += `<rect x="${DOOR + 110}" y="192" width="74" height="62" fill="#3d2b1f"/><rect x="${DOOR + 108}" y="190" width="78" height="4" fill="${C.wood}"/>`;
  for (let r = 0; r < 3; r++) {
    w += `<rect x="${DOOR + 112}" y="${210 + r * 19}" width="70" height="2" fill="${C.wood}"/>`;
    for (let bx = DOOR + 114; bx < DOOR + 178;) {
      const bw = 2 + Math.floor(pr() * 3), bh = 10 + Math.floor(pr() * 5);
      w += `<rect x="${bx}" y="${210 + r * 19 - bh}" width="${bw}" height="${bh}" fill="${["#a8323a", "#1f6f86", "#2f6b4f", "#d9a441", "#3d74a8"][Math.floor(pr() * 5)]}"/>`;
      bx += bw + 0.6;
    }
  }
  for (let x = DOOR + 500; x <= QIBLA - 140; x += 78) {
    w += `<g transform="translate(${x},${CARPET})"><rect x="-14" y="-1" width="28" height="3" fill="#2a7558"/><g fill="#7b72b3"><circle cy="-34" r="6"/><path d="M-7 0 V-21 q7 -8 14 0 V0z"/></g><rect x="-6" y="-41" width="12" height="3" fill="${C.ink}"/></g>`;
  }
  const MB = QIBLA - 112;
  w += `<path d="M${MB} ${CARPET} V244 H${MB + 12} V234 H${MB + 24} V224 H${MB + 36} V214 H${MB + 48} V196 H${MB + 66} V${CARPET}z" fill="${C.wood}"/>` +
       `<path d="M${MB} 238 L${MB + 50} 190" stroke="${C.gold}" stroke-width="2"/><rect x="${MB + 46}" y="166" width="22" height="26" fill="none" stroke="${C.gold}" stroke-width="2"/>` +
       `<path d="M${MB + 44} 166 L${MB + 57} 146 L${MB + 70} 166z" fill="${C.gold}"/><rect x="${MB + 56}" y="138" width="2" height="8" fill="${C.lamp}"/>`;
  w += `<path d="M${QIBLA + 4} ${GROUND} V190 q-26 -20 -30 18 V${GROUND}z" fill="${C.gold}"/>` +
       `<path d="M${QIBLA} ${GROUND} V196 q-20 -16 -22 14 V${GROUND}z" fill="${C.tile}"/><path d="M${QIBLA} ${GROUND} V208 q-12 -8 -13 8 V${GROUND}z" fill="#0f7f86"/>` +
       `<path d="M${QIBLA - 20} 214 q3 -4 6 0 q3 -4 6 0 q3 -4 6 0" fill="none" stroke="${C.gold}" stroke-width="1"/>` +
       `<rect x="${QIBLA}" y="${TOP}" width="30" height="${GROUND - TOP}" fill="${C.stone}"/><rect x="${QIBLA}" y="104" width="30" height="26" fill="url(#tiles)"/>`;

  // ---- the cat: an 8-bit orange tabby, one rect per pixel, two leg frames plus a cartoon wheel for the wind-up ----
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
  w += `<g id="me"><ellipse cx="0" cy="0" rx="19" ry="2.5" fill="#000" opacity=".3"/><g id="sprite" shape-rendering="crispEdges">${px(BODY, 0)}` +
       `<g id="legsA">${px(LEGS[0], 10)}</g><g id="legsB" style="display:none">${px(LEGS[1], 10)}</g>` +
       `<g id="wheel" opacity="0"><ellipse cx="-1" cy="-2.5" rx="16" ry="4" fill="#e8913a" opacity=".6"/><ellipse cx="-1" cy="-2.5" rx="11" ry="2.4" fill="#f7e9cf" opacity=".6"/></g></g></g>`;
  world.innerHTML = w;
  const me = $("me"), sprite = $("sprite"), wheel = $("wheel"), legs = [$("legsA"), $("legsB")];
  const frame = (f) => { legs[0].style.display = f ? "none" : ""; legs[1].style.display = f ? "" : "none"; };

  // ---- tiers, named after the five pillars ----
  $("tiers").innerHTML = TIERS.map((t) => `<li title="${t[2]}"><b>${t[1]}</b>${t[0]}</li>`).join("");
  const tier = (pts) => TIERS.find((t) => t[0] === pts)[1];

  // ---- answer matching: forgiving of spelling ----
  // Both the typed answer and every accepted name are folded to a rough sound skeleton, so common transliteration
  // variants match (Tirmidhi/Tirmizi, Uthman/Osman, Aisha/Ayesha). Small typos are then fixed by edit distance,
  // and a partial name is accepted when it points to only one answer.
  const STOP = /\b(the|al|an|as|at|ar|ash|az|ad|el|a|of|and|imam|sultan|battle|ghazwa|ghazwat|surah|surat|sahih|sunan|jami|hazrat|sayyiduna|prophet|banu|bani|[ivx]+)\b/g;
  const skel = (w) => w.replace(/sh/g, "x").replace(/kh/g, "k").replace(/gh/g, "g").replace(/ph/g, "f").replace(/th|dh|z/g, "s")
    .replace(/[qc]/g, "k").replace(/o/g, "u").replace(/e/g, "i").replace(/w/g, "u").replace(/y/g, "i").replace(/(.)\1+/g, "$1").replace(/(.)h$/, "$1");
  const norm = (t) => t.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/['’`ʿʾ]/g, "").replace(/[-_.,]/g, " ")
    .replace(/\bbin\b/g, "ibn").replace(STOP, " ").split(/[^a-z]+/).filter(Boolean).map(skel).join("");
  P.forEach((p) => p.a.forEach((a) => { a.keys = [...new Set([a[1], ...a.slice(2)].map(norm).filter(Boolean))]; }));
  // Prompts marked numbered (the sultans) share names, so the regnal number picks which one: "Murad IV", "murad 4", "4th murad".
  const ROMAN = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6 }, ORD = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6 };
  P.forEach((p) => { if (p.numbered) p.a.forEach((a) => { const m = a[1].match(/^(\S+)(?: ([IVX]+)\b)?/); a.base = m[1]; a.num = m[2] ? ROMAN[m[2].toLowerCase()] : 1; }); });
  function regnal(text) {
    for (const w of text.toLowerCase().split(/[^a-z0-9]+/)) {
      if (ROMAN[w]) return ROMAN[w];
      if (ORD[w]) return ORD[w];
      const d = w.match(/^(\d+)(st|nd|rd|th)?$/);
      if (d) return +d[1];
    }
    return 0;
  }
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
  // Returns { hit, fixed } for one clear answer, { options } when a partial name fits several, or {} for no match.
  function match(prompt, text) {
    const t = norm(prompt.numbered ? text.replace(/\b(\d+(st|nd|rd|th)?|first|second|third|fourth|fifth|sixth)\b/gi, " ") : text);
    if (!t) return {};
    const tol = t.length <= 3 ? 0 : t.length <= 5 ? 1 : t.length <= 9 ? 2 : 3;
    let best = Infinity, hits = [];
    for (const a of prompt.a) {
      let s = Infinity;
      for (const k of a.keys) {
        if (k === t) { s = 0; break; }
        if (k[0] === t[0] || tol > 1) { const d = lev(k, t); if (d <= tol) s = Math.min(s, d); }
        if ((t.length >= 5 && k.includes(t)) || (k.length >= 5 && t.includes(k))) s = Math.min(s, 1.5);
      }
      if (s < best) { best = s; hits = [a]; } else if (s === best && s < Infinity) hits.push(a);
    }
    if (!hits.length) return {};
    if (prompt.numbered) {
      const n = regnal(text);
      if (n) { hits = hits.filter((a) => a.num === n); if (!hits.length) return {}; }
      else if (hits.length > 1 && new Set(hits.map((a) => a.base)).size === 1) {
        // A bare shared name ("Mehmed") counts as the best-known one: the most common tier.
        return { hit: hits.reduce((x, y) => (y[0] < x[0] ? y : x)), fixed: best > 0, assumed: true };
      }
    }
    if (hits.length > 1) return { options: hits };
    return { hit: hits[0], fixed: best > 0 };
  }
  window.__match = match; // exposed for testing

  // ---- effects: pixel particles on a layer above everything ----
  function particle(x, y, dx, dy, color, size, ms, delay = 0) {
    const el = document.createElement("i");
    el.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${color}`;
    fx.appendChild(el);
    el.animate([{ transform: "translate(0,0)", opacity: 1 }, { transform: `translate(${dx}px,${dy}px)`, opacity: 0 }],
      { duration: ms, delay, easing: "cubic-bezier(.2,.7,.3,1)", fill: "both" }).onfinish = () => el.remove();
  }
  // Rarer answers burst out of the result box: a few sparks for Zakat, a shower for Sawm, confetti and a flash for Hajj.
  function burst(lvl) {
    if (still || lvl < 60) return;
    const r = $("result").getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const n = { 60: 10, 85: 24, 100: 60 }[lvl], reach = { 60: 120, 85: 200, 100: 380 }[lvl];
    const colors = lvl === 100 ? [C.lamp, C.tile, C.carpet, C.ink, "#9fe3ee"] : [C.lamp, C.tile];
    for (let i = 0; i < n; i++) {
      const a = rnd(0, Math.PI * 2), d = rnd(reach * 0.4, reach);
      particle(cx, cy, Math.cos(a) * d, Math.sin(a) * d + (lvl === 100 ? 80 : 0), colors[i % colors.length], lvl === 100 ? rnd(5, 10) : rnd(4, 7), rnd(600, lvl === 100 ? 1500 : 1000), i * 6);
    }
    if (lvl === 100) {
      const f = document.createElement("b");
      f.className = "flash"; fx.appendChild(f);
      f.animate([{ opacity: 0.75 }, { opacity: 0 }], { duration: 650, easing: "ease-out" }).onfinish = () => f.remove();
    }
  }

  // ---- state ----
  let typed = "", assumed = "", scores = P.map(() => 0), said = P.map(() => ""), pos = 0, timer, left, lastX = 0, walk, busy = false, ended = false, sc = 3, fl = 400;
  const total = () => scores.reduce((x, y) => x + y, 0);
  const stage = () => Math.min(7, Math.floor(total() / 100));
  const show = (id, on) => { $(id).hidden = !on; };
  const fix = document.createElement("p"); // "Autocorrected from ..." line in the result box
  fix.className = "muted"; fix.hidden = true; $("r-ans").after(fix);

  // Cartoon wind-up before a rare answer launches the cat: legs blur into a wheel, the cat leans back, dust flies.
  function windup(lvl, ms) {
    const hard = lvl === 100, catX = scene.clientWidth / 2;
    let f = 0;
    sprite.style.transition = "transform .12s";
    sprite.style.transform = `translateX(${hard ? -4 : -3}px) skewX(${hard ? 24 : 14}deg)`;
    wheel.setAttribute("opacity", "1");
    if (hard) scene.classList.add("quake");
    const t0 = performance.now(), iv = setInterval(() => {
      f ^= 1; frame(f);
      if (hard) sprite.style.transform = `translate(${f ? -5 : -3}px,${f ? -1 : 0}px) skewX(24deg)`;
      for (let k = 0; k < (hard ? 2 : 1); k++) particle(catX - 14 * sc, fl - rnd(2, 8), -rnd(30, hard ? 120 : 70), -rnd(4, 28), "rgba(200,205,225,.75)", rnd(4, hard ? 9 : 6), rnd(300, 500));
      if (performance.now() - t0 > ms - 40) { clearInterval(iv); wheel.setAttribute("opacity", "0"); scene.classList.remove("quake"); }
    }, hard ? 28 : 45);
  }

  // Move the cat to where the score puts it and keep the camera on it. lvl 85 and 100 launch it fast with speed lines.
  function place(snap, lvl = 0) {
    const x = X0 + total() * STEP, gy = x > DOOR + 6 ? CARPET : GROUND, W = scene.clientWidth, H = scene.clientHeight;
    const s = Math.max(2.4, Math.min(4.2, H / 200, W / 150)), floor = H - (ended ? 110 : W < 600 ? 330 : 280);
    const fast = still ? 0 : lvl === 100 ? 2 : lvl === 85 ? 1 : 0;
    const d = snap ? 0 : Math.abs(x - lastX), secs = snap ? 0 : d ? [0.9 + d / 400, 0.5 + d / 900, 0.4 + d / 1400][fast] : 0.6;
    lastX = x; sc = s; fl = floor;
    document.documentElement.style.setProperty("--cat-top", Math.round(floor - 30 * s) + "px");
    world.style.transitionDuration = me.style.transitionDuration = secs + "s";
    world.style.transitionTimingFunction = me.style.transitionTimingFunction = fast ? "cubic-bezier(.55,0,.2,1)" : "ease";
    world.style.transform = `translate(${W / 2 - x * s}px,${floor - gy * s}px) scale(${s})`;
    me.style.transform = `translate(${x}px,${gy}px)`;
    clearInterval(walk); frame(0);
    if (d && !still) {
      let f = 0, n = Math.round(secs * 1000 / [140, 50, 30][fast]);
      if (fast) { sprite.style.transition = "transform .1s"; sprite.style.transform = `skewX(${fast === 2 ? -22 : -12}deg)`; }
      walk = setInterval(() => {
        f ^= 1; frame(f);
        if (fast) for (let k = 0; k < fast; k++) {
          const lw = rnd(30, fast === 2 ? 140 : 80);
          particle(W / 2 - 22 * s - lw - rnd(0, 40), floor - rnd(4, 28 * s), -rnd(80, 200), 0, "rgba(243,239,228,.7)", 3, 260);
          fx.lastChild.style.width = lw + "px";
        }
        if (!--n) { clearInterval(walk); frame(0); sprite.style.transform = ""; }
      }, [140, 50, 30][fast]);
    }
    $("pts").textContent = total();
    return secs;
  }

  // ---- one prompt: ask, lock the answer, wind the clock down, then show the result mid-screen ----
  function ask() {
    const p = P[pos];
    busy = false;
    $("tag").textContent = `${p.tag} · ${pos + 1} of ${P.length}`;
    $("q").textContent = p.q; $("hint").textContent = p.hint; $("fb").textContent = "";
    $("ans").value = ""; $("ans").disabled = $("submit").disabled = $("skip").disabled = false;
    show("result", false); show("move", false); show("play", true);
    $("pts").parentElement.className = "box score";
    $("ans").focus();
    left = SECONDS * 10; $("time").style.transition = "none"; tick();
    clearInterval(timer); timer = setInterval(() => { left--; tick(); if (left <= 0) settle(null, "Time is up"); }, 100);
  }
  function tick() { const b = $("time"); b.style.width = Math.max(0, left / (SECONDS * 10) * 100) + "%"; b.classList.toggle("low-time", left < 70); }

  function settle(hit, miss) {
    if (busy) return;
    busy = true; clearInterval(timer);
    $("ans").disabled = $("submit").disabled = $("skip").disabled = true;
    scores[pos] = hit ? hit[0] : 0;
    if (hit) said[pos] = hit[1];
    const wait = left > 0 && !still ? 700 : 0;
    $("time").style.transition = `width ${wait}ms linear`; $("time").style.width = "0%";
    setTimeout(() => reveal(hit, miss), wait);
  }
  function reveal(hit, miss) {
    const lvl = hit ? hit[0] : 0, box = $("result");
    $("r-tier").textContent = hit ? tier(lvl) : miss;
    $("r-ans").textContent = hit ? hit[1] : "No answer";
    fix.textContent = !hit ? "" : assumed ? `No number given, so this counts as the best-known ${assumed}. Add a number for a rarer one.` : typed ? `Autocorrected from "${typed}"` : "";
    fix.hidden = !fix.textContent;
    $("r-pts").textContent = "+" + lvl;
    $("r-place").textContent = "";
    box.className = `box result t${lvl}` + (hit ? "" : " miss");
    show("play", false); show("move", false); show("result", true);
    setTimeout(() => burst(lvl), lvl === 100 ? 250 : 120);
    const wind = still ? 0 : lvl === 100 ? 1300 : lvl === 85 ? 800 : 0;
    if (wind) windup(lvl, wind);
    setTimeout(() => {
      $("pts").parentElement.className = `box score s${lvl}`; // tier shade: lighter green for common answers, emerald for Hajj
      const secs = place(false, lvl);
      setTimeout(() => {
        $("r-place").textContent = STAGE[stage()];
        $("m-count").textContent = `${pos + 1} of ${P.length} answered`;
        $("next").textContent = pos + 1 < P.length ? "Next prompt" : "See how far you got";
        show("move", true); $("next").focus();
      }, secs * 1000 + 150);
    }, wind);
  }

  $("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const text = $("ans").value.trim();
    if (!text || busy) return;
    const m = match(P[pos], text);
    if (m.hit) { typed = m.fixed ? text : ""; assumed = m.assumed ? m.hit.base : ""; return settle(m.hit); }
    if (m.options) {
      const names = m.options.slice(0, 3).map((a) => a[1]);
      $("fb").textContent = `Which one: ${names.join(", ")}${m.options.length > 3 ? " or another" : ""}? Type a little more.`;
    } else {
      said[pos] = text;
      $("fb").textContent = `"${text}" isn't on the list. Try another while the clock runs.`;
    }
    $("ans").select();
  });
  $("skip").addEventListener("click", () => settle(null, "Skipped"));
  $("next").addEventListener("click", () => { if (++pos < P.length) ask(); else finish(); });

  // One attempt: the end screen has no way back in.
  function finish() {
    const t = total();
    $("verdict").textContent = t === 700 ? "Front row. A perfect 700." : `You made it: ${STAGE[stage()].toLowerCase()}.`;
    $("summary").textContent = t === 700 ? "Seven Hajj answers out of seven. Take your place by the mihrab."
      : `${t} of 700 points. ${700 - t} more would have put you in the front row.`;
    $("rows").innerHTML = P.map((p, i) => {
      const top = p.a.filter((a) => a[0] === 100).map((a) => a[1]).join(", ");
      const pts = scores[i] ? `${scores[i]} · ${tier(scores[i])}` : "0";
      return `<tr><td>${p.q}</td><td>${said[i] ? esc(said[i]) : "No answer"}</td><td class="n">${pts}</td><td>${top}</td></tr>`;
    }).join("");
    show("result", false); show("move", false); show("end", true);
    ended = true; place();
  }
  const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  $("begin").addEventListener("click", () => { show("start", false); ask(); });
  window.addEventListener("resize", () => place(true));
  place(true);
})();
