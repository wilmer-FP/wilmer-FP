// Tech-stack panel (desktop + mobile) built from data/stack.json and the
// self-hosted icons in assets/icons — no external image service at view time.
// Icons: Skill Icons by tandpfun (MIT), see assets/icons/LICENSE.
import { readFileSync } from 'node:fs';
import { C, FONT, defs, dotGrid, chip, monoWidth, renderAsset, root, esc } from './brand.mjs';

const groups = JSON.parse(readFileSync(root('data', 'stack.json'), 'utf8'));
const icon = (id) => `data:image/svg+xml;base64,${readFileSync(root('assets', 'icons', `${id}.svg`)).toString('base64')}`;

const tile = (id, label, x, y, { w, h, iconSize, font }) => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${C.surface}" stroke="${C.border}" stroke-width="1.5"/>
  <image href="${icon(id)}" x="${x + (w - iconSize) / 2}" y="${y + 16}" width="${iconSize}" height="${iconSize}"/>
  <text x="${x + w / 2}" y="${y + h - 16}" text-anchor="middle" font-family="${FONT.display}" font-weight="500" font-size="${font}" fill="${C.text}">${esc(label)}</text>`;

const frame = (W, H, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${defs()}${dotGrid('b', 22, 0.1)}</defs>
  <clipPath id="c"><rect width="${W}" height="${H}" rx="22"/></clipPath>
  <g clip-path="url(#c)">
    <rect width="${W}" height="${H}" fill="${C.bg}"/>
    <rect width="${W}" height="${H}" fill="url(#b-dots)"/>
    <rect width="${W}" height="6" fill="url(#b-grad)"/>
  </g>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="22" fill="none" stroke="${C.border}" stroke-width="2"/>
  ${body}
</svg>`;

// ── desktop: one row per group, label column on the left ──
{
  const W = 1600, ROW = 168, TOP = 96, TX = 400;
  const t = { w: 116, h: 128, iconSize: 64, font: 18 };
  const rows = groups.map((g, gi) => {
    const y = TOP + gi * ROW;
    let x = TX;
    const tiles = g.icons.map(([id, label]) => { const s = tile(id, label, x, y, t); x += t.w + 14; return s; }).join('');
    x += 16;
    const chips = g.chips.map((c) => { const ch = chip(c, x, y + t.h / 2 - 17, { size: 17 }); x += ch.width + 10; return ch.svg; }).join('');
    return `
      <text x="56" y="${y + 56}" font-family="${FONT.mono}" font-size="17" letter-spacing="4" fill="${C.accent}">${esc(g.label)}</text>
      <text x="56" y="${y + 88}" font-family="${FONT.display}" font-size="20" fill="${C.muted}">${esc(g.es)}</text>
      ${gi > 0 ? `<line x1="56" y1="${y - 20}" x2="${W - 56}" y2="${y - 20}" stroke="${C.border}" stroke-width="1"/>` : ''}
      ${tiles}${chips}`;
  }).join('');
  const H = TOP + groups.length * ROW + 8;
  renderAsset(frame(W, H, `
    <text x="56" y="62" font-family="${FONT.display}" font-weight="700" font-size="30" fill="${C.text}"><tspan fill="${C.primary}" font-family="${FONT.mono}">&gt;_</tspan> Tech stack</text>
    ${rows}`), { svgPath: root('assets', 'src', 'stack.svg'), pngPath: root('assets', 'stack.png'), width: W });
  console.log('  assets/stack.png');
}

// ── mobile: groups stacked, 4 tiles per row, larger type ──
{
  const W = 800, PAD = 40, COLS = 4, GAP = 16;
  const t = { w: (W - PAD * 2 - GAP * (COLS - 1)) / COLS, h: 168, iconSize: 84, font: 26 };
  let y = 120;
  const parts = [];
  groups.forEach((g, gi) => {
    if (gi > 0) { parts.push(`<line x1="${PAD}" y1="${y - 26}" x2="${W - PAD}" y2="${y - 26}" stroke="${C.border}" stroke-width="1.5"/>`); }
    parts.push(`<text x="${PAD}" y="${y}" font-family="${FONT.mono}" font-size="22" letter-spacing="4" fill="${C.accent}">${esc(g.label)}</text>`);
    y += 24;
    g.icons.forEach(([id, label], i) => {
      const col = i % COLS, row = Math.floor(i / COLS);
      parts.push(tile(id, label, PAD + col * (t.w + GAP), y + row * (t.h + GAP), t));
    });
    y += Math.ceil(g.icons.length / COLS) * (t.h + GAP);
    let x = PAD;
    g.chips.forEach((c) => {
      const w = monoWidth(c, 24) + 36;
      if (x + w > W - PAD) { x = PAD; y += 58; }
      parts.push(chip(c, x, y, { size: 24, padX: 18, h: 46 }).svg);
      x += w + 12;
    });
    if (g.chips.length) y += 58;
    y += 70;
  });
  const H = y - 30;
  renderAsset(frame(W, H, `
    <text x="${PAD}" y="70" font-family="${FONT.display}" font-weight="700" font-size="40" fill="${C.text}"><tspan fill="${C.primary}" font-family="${FONT.mono}">&gt;_</tspan> Tech stack</text>
    ${parts.join('')}`), { pngPath: root('assets', 'stack-mobile.png'), width: W });
  console.log('  assets/stack-mobile.png');
}
