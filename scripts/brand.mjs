// WILMERFP brand system — single source of truth for colors, fonts and shared
// SVG building blocks. Every generated asset imports from here.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const require = createRequire(import.meta.url);

export const C = {
  bg: '#0D1117',
  surface: '#161B22',
  border: '#30363D',
  primary: '#58A6FF',
  accent: '#22D3EE',
  text: '#E6EDF3',
  muted: '#8B949E',
};

export const FONT = {
  display: 'Space Grotesk',
  mono: 'JetBrains Mono',
};

const fontFiles = [
  '@expo-google-fonts/space-grotesk/400Regular/SpaceGrotesk_400Regular.ttf',
  '@expo-google-fonts/space-grotesk/500Medium/SpaceGrotesk_500Medium.ttf',
  '@expo-google-fonts/space-grotesk/600SemiBold/SpaceGrotesk_600SemiBold.ttf',
  '@expo-google-fonts/space-grotesk/700Bold/SpaceGrotesk_700Bold.ttf',
  '@expo-google-fonts/jetbrains-mono/400Regular/JetBrainsMono_400Regular.ttf',
  '@expo-google-fonts/jetbrains-mono/500Medium/JetBrainsMono_500Medium.ttf',
  '@expo-google-fonts/jetbrains-mono/700Bold/JetBrainsMono_700Bold.ttf',
].map((f) => require.resolve(f));

/** Render an SVG string to PNG and write both files. */
export function renderAsset(svg, { svgPath, pngPath, width }) {
  if (svgPath) {
    mkdirSync(dirname(svgPath), { recursive: true });
    writeFileSync(svgPath, svg);
  }
  const png = new Resvg(svg, {
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: FONT.display },
    fitTo: width ? { mode: 'width', value: width } : { mode: 'original' },
    shapeRendering: 2,
    textRendering: 2,
  }).render().asPng();
  mkdirSync(dirname(pngPath), { recursive: true });
  writeFileSync(pngPath, png);
  return png.length;
}

export const root = (...p) => join(fileURLToPath(new URL('..', import.meta.url)), ...p);

/** Deterministic PRNG so assets are reproducible between builds. */
export function rng(seed = 7) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Monospace advance width (JetBrains Mono = 0.6em). */
export const monoWidth = (text, size, spacing = 0) => text.length * size * 0.6 + Math.max(0, text.length - 1) * spacing;

/** Shared gradient defs. Call once per document. */
export const defs = (id = 'b') => `
  <linearGradient id="${id}-grad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.primary}"/>
    <stop offset="1" stop-color="${C.accent}"/>
  </linearGradient>
  <linearGradient id="${id}-hfade" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.primary}" stop-opacity="0"/>
    <stop offset=".5" stop-color="${C.primary}" stop-opacity=".9"/>
    <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
  </linearGradient>
  <filter id="${id}-glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="3" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="${id}-softglow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="10"/>
  </filter>`;

/**
 * The WILMERFP monogram: a W whose last stroke doubles as the (slanted) stem
 * of an F, set inside a microchip outline. Drawn in a 120×120 box.
 */
export function monogram({ x = 0, y = 0, size = 120, id = 'b', chip = true, glow = true } = {}) {
  const s = size / 120;
  const pins = [];
  if (chip) {
    for (const p of [34, 52, 68, 86]) {
      pins.push(`M${p} 12V3`, `M${p} 108v9`, `M12 ${p}H3`, `M108 ${p}h9`);
    }
  }
  const glyph = `
    <g transform="translate(60 61) scale(.64) translate(-62 -60)" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 34 L32 86 L46 50 L60 86 L76 34" stroke="${C.primary}" stroke-width="9"/>
      <path d="M76 34 H104 M68 60 H94" stroke="${C.accent}" stroke-width="9"/>
      <circle cx="16" cy="34" r="7" fill="${C.bg}" stroke="${C.primary}" stroke-width="5"/>
      <circle cx="108" cy="34" r="5.5" fill="${C.accent}"/>
      <circle cx="98" cy="60" r="5.5" fill="${C.accent}"/>
    </g>`;
  return `
  <g transform="translate(${x} ${y}) scale(${s})">
    ${chip ? `
    <path d="${pins.join(' ')}" stroke="${C.primary}" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/>
    <rect x="12" y="12" width="96" height="96" rx="18" fill="${C.surface}" stroke="url(#${id}-grad)" stroke-width="3"/>
    <rect x="20" y="20" width="80" height="80" rx="12" fill="none" stroke="${C.border}" stroke-width="1.5"/>
    <circle cx="28" cy="92" r="2.5" fill="${C.muted}" fill-opacity=".6"/>` : ''}
    <g ${glow ? `filter="url(#${id}-glow)"` : ''}>${glyph}</g>
  </g>`;
}

/** Rounded pill with mono label. Returns { svg, width }. */
export function chip(label, x, y, { size = 16, padX = 14, h = 34, color = C.primary } = {}) {
  const w = monoWidth(label, size) + padX * 2;
  return {
    width: w,
    svg: `
    <g transform="translate(${x} ${y})">
      <rect width="${w}" height="${h}" rx="${h / 2}" fill="${C.surface}" stroke="${color}" stroke-opacity=".55" stroke-width="1.5"/>
      <text x="${w / 2}" y="${h / 2 + size * 0.36}" text-anchor="middle" font-family="${FONT.mono}" font-size="${size}" fill="${C.text}">${esc(label)}</text>
    </g>`,
  };
}

export function chipRow(labels, x, y, opts = {}) {
  let cx = x;
  const gap = opts.gap ?? 10;
  const parts = labels.map((l) => {
    const c = chip(l, cx, y, opts);
    cx += c.width + gap;
    return c.svg;
  });
  return { svg: parts.join(''), end: cx - gap };
}

/** Orthogonal/45° circuit trace with a pad at the end. */
export function trace(points, { color = C.primary, opacity = 0.5, width = 2, pad = true, padStart = false } = {}) {
  const d = 'M' + points.map((p) => p.join(' ')).join(' L');
  const [ex, ey] = points[points.length - 1];
  const [sx, sy] = points[0];
  return `
    <path d="${d}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${width}" stroke-linejoin="round"/>
    ${pad ? `<circle cx="${ex}" cy="${ey}" r="4" fill="${C.bg}" stroke="${C.accent}" stroke-width="2"/>` : ''}
    ${padStart ? `<circle cx="${sx}" cy="${sy}" r="3" fill="${color}"/>` : ''}`;
}

/** Dot-grid background pattern definition. */
export const dotGrid = (id = 'b', step = 24, opacity = 0.14) => `
  <pattern id="${id}-dots" width="${step}" height="${step}" patternUnits="userSpaceOnUse">
    <circle cx="${step / 2}" cy="${step / 2}" r="1" fill="${C.muted}" fill-opacity="${opacity}"/>
  </pattern>`;
