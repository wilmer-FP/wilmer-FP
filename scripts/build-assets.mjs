// Builds every static WILMERFP asset: assets/src/*.svg (editable sources)
// and assets/*.png (what the README uses). Run: npm run build:assets
import { readFileSync } from 'node:fs';
import { C, FONT, defs, monogram, chipRow, trace, dotGrid, renderAsset, root, rng, esc } from './brand.mjs';

const out = (name, svg, width) => {
  const bytes = renderAsset(svg, {
    svgPath: root('assets', 'src', `${name}.svg`),
    pngPath: root('assets', `${name}.png`),
    width,
  });
  console.log(`  assets/${name}.png  ${(bytes / 1024).toFixed(0)} KB`);
};

const doc = (w, h, body, extraDefs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs()}${extraDefs}</defs>${body}</svg>`;

// ───────────────────────────────── monogram ─────────────────────────────────
out('monogram', doc(120, 120, monogram({ size: 120 })), 512);

// ───────────────────────────────── avatar ───────────────────────────────────
out(
  'avatar',
  doc(
    460,
    460,
    `<rect width="460" height="460" fill="${C.bg}"/>
     <rect width="460" height="460" fill="url(#b-dots)"/>
     <circle cx="230" cy="230" r="180" fill="url(#av-glow)"/>
     ${monogram({ x: 70, y: 70, size: 320 })}`,
    `${dotGrid('b', 20, 0.12)}
     <radialGradient id="av-glow"><stop offset="0" stop-color="${C.primary}" stop-opacity=".28"/><stop offset="1" stop-color="${C.primary}" stop-opacity="0"/></radialGradient>`,
  ),
  460,
);

// ───────────────────────────────── logo ─────────────────────────────────────
const logoBody = (plate) => `
  ${plate ? `<rect x="1" y="1" width="1198" height="318" rx="28" fill="${C.bg}" stroke="${C.border}" stroke-width="2"/>
  <rect x="1" y="1" width="1198" height="318" rx="28" fill="url(#b-dots)"/>` : ''}
  ${monogram({ x: 56, y: 60, size: 200 })}
  <text x="300" y="180" font-family="${FONT.display}" font-weight="700" font-size="112" letter-spacing="6" fill="${C.text}">WILMER<tspan fill="${C.primary}">FP</tspan><tspan font-family="${FONT.mono}" font-size="88" fill="${C.accent}" dx="2">_</tspan></text>
  <text x="304" y="238" font-family="${FONT.mono}" font-size="26" fill="${C.muted}">Designing logic. Building solutions.</text>`;
out('logo', doc(1200, 320, logoBody(true), dotGrid('b', 24, 0.1)), 1200);
out('logo-transparent', doc(1200, 320, logoBody(false)), 1200);

// ───────────────────────────────── banner ───────────────────────────────────
function banner() {
  const W = 1600, H = 440, G = 392; // G = ground line
  const r = rng(42);

  // Mountains — a wireframe Andes-like ridge behind the server racks.
  const back = [[700, G], [800, 318], [880, 340], [960, 236], [1040, 132], [1110, 214], [1170, 186], [1250, 262], [1330, 210], [1420, 252], [1500, 196], [1600, 240], [1600, G]];
  const front = [[720, G], [820, 360], [900, 372], [990, 318], [1080, 352], [1160, 330], [1240, 364], [1600, 330], [1600, G]];
  const poly = (pts) => pts.map((p) => p.join(',')).join(' ');
  const wire = back.slice(1, -1).flatMap(([x, y], i, arr) => {
    const lines = [`M${x} ${y} L${x - 46} ${G}`, `M${x} ${y} L${x + 52} ${G}`];
    if (arr[i + 1]) lines.push(`M${x} ${y} L${(x + arr[i + 1][0]) / 2} ${G - 30}`);
    return lines;
  });

  // Server racks — rising to the right for depth.
  const racks = [
    { x: 1236, w: 66, h: 180 },
    { x: 1316, w: 70, h: 222 },
    { x: 1400, w: 74, h: 262 },
    { x: 1488, w: 84, h: 300 },
  ];
  const rackSvg = racks.map(({ x, w, h }) => {
    const top = G - h;
    const units = [];
    for (let uy = top + 18; uy < G - 16; uy += 17) {
      const roll = r();
      const led1 = roll < 0.4 ? C.accent : roll < 0.75 ? C.primary : C.border;
      const led2 = r() < 0.5 ? C.primary : C.border;
      const bar = 8 + r() * (w - 44);
      units.push(`
        <rect x="${x + 8}" y="${uy}" width="${w - 16}" height="11" rx="2" fill="${C.bg}" stroke="${C.border}" stroke-width="1"/>
        <rect x="${x + 12}" y="${uy + 4}" width="${bar.toFixed(1)}" height="3" rx="1.5" fill="${C.primary}" fill-opacity=".35"/>
        <circle cx="${x + w - 20}" cy="${uy + 5.5}" r="2" fill="${led1}"/>
        <circle cx="${x + w - 13}" cy="${uy + 5.5}" r="2" fill="${led2}"/>`);
    }
    return `
      <rect x="${x}" y="${top}" width="${w}" height="${h}" rx="5" fill="${C.surface}" stroke="${C.border}" stroke-width="1.5"/>
      <rect x="${x}" y="${top}" width="${w}" height="4" rx="2" fill="url(#b-grad)"/>
      ${units.join('')}`;
  }).join('');

  // Perspective floor grid under the racks.
  const floor = [];
  for (let i = -14; i <= 14; i++) floor.push(`M${1300 + i * 22} ${G} L${1300 + i * 90} ${H}`);
  for (const fy of [404, 418, 436]) floor.push(`M700 ${fy} H${W}`);

  const chips = chipRow(['Backend', 'REST APIs', 'Databases', 'Software Architecture'], 240, 322, { size: 16 });

  return doc(W, H, `
    <clipPath id="clip"><rect width="${W}" height="${H}" rx="18"/></clipPath>
    <g clip-path="url(#clip)">
      <rect width="${W}" height="${H}" fill="${C.bg}"/>
      <rect width="${W}" height="${H}" fill="url(#b-dots)" mask="url(#fadeL)"/>
      <ellipse cx="1060" cy="190" rx="520" ry="260" fill="url(#glowA)"/>
      <ellipse cx="180" cy="420" rx="380" ry="160" fill="url(#glowB)"/>

      <!-- top circuitry -->
      ${trace([[760, -2], [760, 34], [792, 66], [910, 66]], { opacity: 0.4 })}
      ${trace([[1140, -2], [1140, 26], [1172, 58], [1262, 58]], { opacity: 0.35 })}
      ${trace([[1600, 120], [1586, 120], [1586, 26], [1604, 8]], { opacity: 0.3, pad: false })}

      <!-- mountains -->
      <polygon points="${poly(back)}" fill="url(#mtn)" stroke="${C.primary}" stroke-opacity=".55" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="${wire.join(' ')}" stroke="${C.primary}" stroke-opacity=".12" stroke-width="1"/>
      <polyline points="1012,170 1040,132 1068,166" fill="none" stroke="${C.text}" stroke-opacity=".8" stroke-width="2.4" stroke-linejoin="round" filter="url(#b-glow)"/>
      <polygon points="${poly(front)}" fill="${C.bg}" fill-opacity=".92" stroke="${C.primary}" stroke-opacity=".28" stroke-width="1.2"/>

      <!-- data traces: logic → servers -->
      ${trace([[952, 262], [1010, 262], [1028, 280], [1230, 280]], { opacity: 0.6, padStart: true })}
      ${trace([[940, 312], [1110, 312], [1128, 330], [1230, 330]], { opacity: 0.45, padStart: true })}
      ${trace([[930, 196], [958, 176], [1150, 176], [1178, 204], [1230, 204]], { opacity: 0.35, padStart: true })}

      <!-- floor + racks -->
      <path d="${floor.join(' ')}" stroke="${C.primary}" stroke-opacity=".14" stroke-width="1"/>
      <line x1="700" y1="${G}" x2="${W}" y2="${G}" stroke="url(#b-hfade)" stroke-width="2"/>
      ${rackSvg}

      <!-- identity -->
      <text x="64" y="58" font-family="${FONT.mono}" font-size="15" letter-spacing="5" fill="${C.muted}">WILMERFP <tspan fill="${C.primary}">//</tspan> BACKEND</text>
      <text x="${W - 40}" y="54" text-anchor="end" font-family="${FONT.mono}" font-size="22" letter-spacing="3" fill="${C.text}" fill-opacity=".85">wilmerfp<tspan fill="${C.accent}">_</tspan></text>

      ${monogram({ x: 62, y: 106, size: 150 })}
      <text x="240" y="128" font-family="${FONT.mono}" font-size="18" fill="${C.accent}">~/wilmerfp <tspan fill="${C.muted}">$</tspan> <tspan fill="${C.text}">whoami</tspan></text>
      <text x="236" y="200" font-family="${FONT.display}" font-weight="700" font-size="76" fill="${C.text}">Wilmer Flórez</text>
      <text x="240" y="246" font-family="${FONT.display}" font-weight="500" font-size="27" fill="${C.muted}"><tspan font-weight="600" fill="${C.primary}">Backend Developer</tspan> · Systems Engineering Student</text>
      <text x="240" y="292" font-family="${FONT.mono}" font-size="21" fill="${C.text}">Designing logic. Building solutions.<tspan fill="${C.accent}">_</tspan></text>
      ${chips.svg}
      <text x="64" y="412" font-family="${FONT.mono}" font-size="13" letter-spacing="4" fill="${C.muted}">ENGINEERING IDEAS INTO SOFTWARE <tspan fill="${C.primary}">·</tspan> COLOMBIA</text>
    </g>
    <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="none" stroke="${C.border}" stroke-width="2"/>`,
  `${dotGrid('b', 24, 0.16)}
   <linearGradient id="fadeLg" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".6" stop-color="#fff" stop-opacity="1"/></linearGradient>
   <mask id="fadeL"><rect width="${W}" height="${H}" fill="url(#fadeLg)"/></mask>
   <radialGradient id="glowA"><stop offset="0" stop-color="${C.primary}" stop-opacity=".2"/><stop offset="1" stop-color="${C.primary}" stop-opacity="0"/></radialGradient>
   <radialGradient id="glowB"><stop offset="0" stop-color="${C.accent}" stop-opacity=".08"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient>
   <linearGradient id="mtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B2A44"/><stop offset="1" stop-color="${C.bg}"/></linearGradient>`);
}
out('banner', banner(), 1600);

// ───────────────────────────────── divider ──────────────────────────────────
out('divider', doc(1600, 28, `
  <line x1="40" y1="14" x2="760" y2="14" stroke="url(#b-hfade)" stroke-width="1.5"/>
  <line x1="840" y1="14" x2="1560" y2="14" stroke="url(#b-hfade)" stroke-width="1.5"/>
  <rect x="790" y="4" width="20" height="20" rx="3" transform="rotate(45 800 14)" fill="${C.bg}" stroke="${C.accent}" stroke-width="2"/>
  <circle cx="800" cy="14" r="3" fill="${C.accent}"/>
  <circle cx="770" cy="14" r="2.5" fill="${C.primary}"/><circle cx="830" cy="14" r="2.5" fill="${C.primary}"/>`), 1600);

// ───────────────────────────────── footer ───────────────────────────────────
out('footer', doc(1600, 220, `
  <rect x="1" y="1" width="1598" height="218" rx="18" fill="${C.bg}" stroke="${C.border}" stroke-width="2"/>
  <rect x="1" y="1" width="1598" height="218" rx="18" fill="url(#b-dots)"/>
  ${trace([[40, 128], [560, 128], [590, 98], [700, 98]], { opacity: 0.5, padStart: true })}
  ${trace([[1560, 128], [1040, 128], [1010, 98], [900, 98]], { opacity: 0.5, padStart: true })}
  ${monogram({ x: 752, y: 62, size: 96 })}
  <text x="800" y="44" text-anchor="middle" font-family="${FONT.mono}" font-size="16" letter-spacing="9" fill="${C.primary}">DESIGN · BUILD · TEST · DEPLOY</text>
  <text x="800" y="194" text-anchor="middle" font-family="${FONT.display}" font-weight="500" font-size="20" fill="${C.muted}">Engineering ideas into software <tspan fill="${C.primary}">·</tspan> <tspan font-family="${FONT.mono}" fill="${C.text}">wilmerfp</tspan><tspan font-family="${FONT.mono}" fill="${C.accent}">_</tspan></text>`,
  dotGrid('b', 24, 0.1)), 1600);

// ───────────────────────────────── project cards ────────────────────────────
const projects = JSON.parse(readFileSync(root('data', 'projects.json'), 'utf8'));
for (const p of projects) {
  const chips = chipRow(p.stack, 56, 286, { size: 15, h: 32 });
  const flow = (p.flow ?? []).map((node, i, arr) => {
    const x = 930 + i * 216, y = 152;
    const box = `
      <rect x="${x}" y="${y}" width="176" height="84" rx="12" fill="${C.bg}" stroke="${i === 1 ? C.primary : C.border}" stroke-width="${i === 1 ? 2 : 1.5}"/>
      <text x="${x + 88}" y="${y + 38}" text-anchor="middle" font-family="${FONT.display}" font-weight="600" font-size="21" fill="${C.text}">${esc(node.title)}</text>
      <text x="${x + 88}" y="${y + 64}" text-anchor="middle" font-family="${FONT.mono}" font-size="14" fill="${C.muted}">${esc(node.sub)}</text>`;
    const link = i < arr.length - 1
      ? `${trace([[x + 176, y + 42], [x + 216, y + 42]], { opacity: 0.8, pad: false })}
         <path d="M${x + 206} ${y + 36} l8 6 l-8 6" fill="none" stroke="${C.accent}" stroke-width="2"/>
         <text x="${x + 196}" y="${y + 120}" text-anchor="middle" font-family="${FONT.mono}" font-size="13" fill="${C.muted}">${esc(node.edge ?? '')}</text>`
      : '';
    return box + link;
  }).join('');

  out(`cards/${p.id}`, doc(1600, 400, `
    <clipPath id="cc"><rect width="1600" height="400" rx="22"/></clipPath>
    <g clip-path="url(#cc)">
      <rect width="1600" height="400" fill="${C.surface}"/>
      <rect x="880" width="720" height="400" fill="url(#b-dots)"/>
      <rect width="6" height="400" fill="url(#b-grad)"/>
      <text x="56" y="68" font-family="${FONT.mono}" font-size="16" letter-spacing="3" fill="${C.accent}">${esc(p.label)}</text>
      <text x="54" y="132" font-family="${FONT.display}" font-weight="700" font-size="52" fill="${C.text}">${esc(p.title)}</text>
      ${p.lines.map((l, i) => `<text x="56" y="${180 + i * 32}" font-family="${FONT.display}" font-size="23" fill="${i === p.lines.length - 1 && p.highlightLast ? C.text : C.muted}">${esc(l)}</text>`).join('')}
      ${chips.svg}
      <text x="56" y="366" font-family="${FONT.mono}" font-size="17" fill="${C.primary}">${esc(p.linkLabel)} →</text>
      ${flow ? `<text x="930" y="118" font-family="${FONT.mono}" font-size="14" letter-spacing="4" fill="${C.muted}">ARCHITECTURE</text>${flow}` : ''}
    </g>
    <rect x="1" y="1" width="1598" height="398" rx="22" fill="none" stroke="${C.border}" stroke-width="2"/>`,
    dotGrid('b', 22, 0.12)), 1600);
}
console.log('done');
