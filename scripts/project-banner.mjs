// Branded banner for any future WILMERFP repository.
//
//   npm run project-banner -- --name "Inventory API" \
//     --tagline "Stock control REST API with audit trail" \
//     --stack "Python,FastAPI,PostgreSQL" --type "PERSONAL PROJECT" \
//     --out ../my-repo/docs/banner.png
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { C, FONT, defs, monogram, chipRow, trace, dotGrid, renderAsset, esc, root } from './brand.mjs';

const { values: a } = parseArgs({
  options: {
    name: { type: 'string' },
    tagline: { type: 'string', default: '' },
    stack: { type: 'string', default: '' },
    type: { type: 'string', default: 'PERSONAL PROJECT' },
    out: { type: 'string', default: root('assets', 'examples', 'project-banner.png') },
  },
});
if (!a.name) {
  console.error('Usage: npm run project-banner -- --name "Project" [--tagline ".."] [--stack "A,B"] [--type ".."] [--out file.png]');
  process.exit(1);
}

const W = 1600, H = 360;
const stack = a.stack.split(',').map((s) => s.trim()).filter(Boolean);
const chips = chipRow(stack, 64, 262, { size: 16 });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${defs()}${dotGrid('b', 24, 0.14)}
    <radialGradient id="g"><stop offset="0" stop-color="${C.primary}" stop-opacity=".18"/><stop offset="1" stop-color="${C.primary}" stop-opacity="0"/></radialGradient>
  </defs>
  <clipPath id="c"><rect width="${W}" height="${H}" rx="18"/></clipPath>
  <g clip-path="url(#c)">
    <rect width="${W}" height="${H}" fill="${C.bg}"/>
    <rect x="800" width="800" height="${H}" fill="url(#b-dots)"/>
    <ellipse cx="1330" cy="180" rx="420" ry="220" fill="url(#g)"/>
    ${trace([[1100, 120], [1180, 120], [1210, 150], [1300, 150]], { opacity: 0.5, padStart: true })}
    ${trace([[1080, 240], [1200, 240], [1230, 210], [1300, 210]], { opacity: 0.5, padStart: true })}
    ${trace([[1600, 180], [1476, 180]], { opacity: 0.4, pad: false })}
    ${monogram({ x: 1300, y: 80, size: 200 })}
  </g>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="none" stroke="${C.border}" stroke-width="2"/>
  <text x="64" y="76" font-family="${FONT.mono}" font-size="16" letter-spacing="4" fill="${C.accent}">${esc(a.type.toUpperCase())}</text>
  <text x="60" y="160" font-family="${FONT.display}" font-weight="700" font-size="68" fill="${C.text}">${esc(a.name)}</text>
  <text x="64" y="214" font-family="${FONT.display}" font-size="26" fill="${C.muted}">${esc(a.tagline)}</text>
  ${chips.svg}
  <text x="${W - 40}" y="${H - 28}" text-anchor="end" font-family="${FONT.mono}" font-size="16" letter-spacing="2" fill="${C.muted}">wilmerfp<tspan fill="${C.accent}">_</tspan></text>
</svg>`;

const out = resolve(a.out);
renderAsset(svg, { pngPath: out, width: W });
console.log(`wrote ${out}`);
