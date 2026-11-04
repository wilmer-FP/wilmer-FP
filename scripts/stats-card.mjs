// Generates assets/stats.png from live GitHub GraphQL data — no third-party
// stats service, no invented numbers. Runs daily in .github/workflows/stats.yml.
//
// Local run (token is read from the GitHub CLI, never written to disk):
//   GITHUB_TOKEN=$(gh auth token) npm run build:stats
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { C, FONT, defs, dotGrid, renderAsset, root, esc } from './brand.mjs';

const LOGIN = process.env.GITHUB_LOGIN || 'wilmer-FP';
const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error('GITHUB_TOKEN is required (locally: GITHUB_TOKEN=$(gh auth token) npm run build:stats)');
  process.exit(1);
}

const query = `query($login: String!) {
  user(login: $login) {
    login
    followers { totalCount }
    following { totalCount }
    repositories(ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false, first: 100) {
      totalCount
      nodes { stargazerCount languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } } }
    }
    repositoriesContributedTo(first: 1, includeUserRepositories: false, contributionTypes: [COMMIT, PULL_REQUEST, ISSUE, REPOSITORY]) { totalCount }
    contributionsCollection {
      contributionCalendar { totalContributions weeks { contributionDays { contributionCount date weekday } } }
    }
  }
}`;

const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'wilmerfp-stats-card' },
  body: JSON.stringify({ query, variables: { login: LOGIN } }),
});
const json = await res.json();
if (!res.ok || json.errors) {
  console.error('GitHub API error:', JSON.stringify(json.errors ?? json, null, 2));
  process.exit(1);
}
const u = json.data.user;
const repos = u.repositories.nodes;
const stars = repos.reduce((s, r) => s + r.stargazerCount, 0);
const cal = u.contributionsCollection.contributionCalendar;

// Language bytes across own public repositories.
const langs = new Map();
for (const r of repos) for (const e of r.languages.edges) {
  const cur = langs.get(e.node.name) ?? { size: 0, color: e.node.color };
  cur.size += e.size;
  langs.set(e.node.name, cur);
}
const langTotal = [...langs.values()].reduce((s, l) => s + l.size, 0);
const topLangs = [...langs.entries()].sort((a, b) => b[1].size - a[1].size).slice(0, 5);

// ── layout ──
const W = 1600, H = 440, PX = 560;
const rows = [
  ['Public repositories', u.repositories.totalCount],
  ['Contributions · 12 mo', cal.totalContributions],
  ['Repos contributed to', u.repositoriesContributedTo.totalCount],
  ['Stars earned', stars],
  ['Followers · Following', `${u.followers.totalCount} · ${u.following.totalCount}`],
];
const statRows = rows.map(([label, value], i) => {
  const y = 168 + i * 52;
  return `
    <text x="48" y="${y}" font-family="${FONT.display}" font-size="21" fill="${C.muted}">${esc(label)}</text>
    <text x="478" y="${y + 2}" text-anchor="end" font-family="${FONT.mono}" font-weight="700" font-size="28" fill="${C.text}">${esc(value)}</text>
    ${i < rows.length - 1 ? `<line x1="48" y1="${y + 20}" x2="478" y2="${y + 20}" stroke="${C.border}" stroke-width="1"/>` : ''}`;
}).join('');

// Contribution heatmap (last 53 weeks).
const weeks = cal.weeks.slice(-53);
const max = Math.max(1, ...weeks.flatMap((w) => w.contributionDays.map((d) => d.contributionCount)));
const levelFill = (n) => {
  if (n === 0) return `fill="${C.surface}" stroke="${C.border}" stroke-width="1"`;
  const lvl = Math.ceil((n / max) * 4);
  const op = [0, 0.35, 0.55, 0.78, 1][lvl];
  return `fill="${lvl === 4 ? C.accent : C.primary}" fill-opacity="${op}"`;
};
const CELL = 15, GAP = 4, HY = 124;
const cells = [], months = [];
let lastMonth = -1;
weeks.forEach((w, wi) => {
  const x = PX + wi * (CELL + GAP);
  const first = new Date(w.contributionDays[0].date + 'T00:00:00Z');
  if (first.getUTCMonth() !== lastMonth && wi < weeks.length - 2) {
    lastMonth = first.getUTCMonth();
    if (wi > 0 || first.getUTCDate() <= 7) {
      months.push(`<text x="${x}" y="${HY - 12}" font-family="${FONT.mono}" font-size="13" fill="${C.muted}">${first.toLocaleString('en', { month: 'short', timeZone: 'UTC' })}</text>`);
    }
  }
  for (const d of w.contributionDays) {
    cells.push(`<rect x="${x}" y="${HY + d.weekday * (CELL + GAP)}" width="${CELL}" height="${CELL}" rx="3" ${levelFill(d.contributionCount)}/>`);
  }
});
const legendX = PX + 53 * (CELL + GAP) - 5 * (CELL + GAP) - 52;
const legend = [0, 1, 2, 3, 4].map((l, i) =>
  `<rect x="${legendX + i * (CELL + GAP)}" y="268" width="${CELL}" height="${CELL}" rx="3" ${l === 0 ? levelFill(0) : `fill="${l === 4 ? C.accent : C.primary}" fill-opacity="${[0, 0.35, 0.55, 0.78, 1][l]}"`}/>`).join('');

// Language bar.
let langSvg;
if (topLangs.length) {
  let lx = PX;
  const barW = 53 * (CELL + GAP) - GAP;
  const segs = topLangs.map(([, l]) => {
    const w = (l.size / langTotal) * barW;
    const s = `<rect x="${lx.toFixed(1)}" y="330" width="${Math.max(2, w - 2).toFixed(1)}" height="10" rx="3" fill="${l.color ?? C.primary}"/>`;
    lx += w;
    return s;
  }).join('');
  let tx = PX;
  const labels = topLangs.map(([name, l]) => {
    const s = `<circle cx="${tx + 6}" cy="${364}" r="5" fill="${l.color ?? C.primary}"/><text x="${tx + 18}" y="${369}" font-family="${FONT.mono}" font-size="14" fill="${C.text}">${esc(name)} <tspan fill="${C.muted}">${((l.size / langTotal) * 100).toFixed(1)}%</tspan></text>`;
    tx += 18 + (name.length + 7) * 8.4 + 22;
    return s;
  }).join('');
  langSvg = segs + labels;
} else {
  langSvg = `<rect x="${PX}" y="330" width="${53 * (CELL + GAP) - GAP}" height="10" rx="3" fill="${C.surface}" stroke="${C.border}"/>
    <text x="${PX}" y="369" font-family="${FONT.mono}" font-size="14" fill="${C.muted}">Language breakdown appears here once public repositories are published.</text>`;
}

// Keep the date stable unless the numbers change, so the daily workflow only
// commits when there is something new to show.
const snapshot = {
  login: u.login,
  repos: u.repositories.totalCount,
  contributions: cal.totalContributions,
  contributedTo: u.repositoriesContributedTo.totalCount,
  stars,
  followers: u.followers.totalCount,
  following: u.following.totalCount,
  languages: topLangs.map(([n, l]) => [n, l.size]),
  calendar: weeks.map((w) => w.contributionDays.map((d) => d.contributionCount).join(',')).join(';'),
  firstDay: weeks[0].contributionDays[0].date,
};
const statePath = root('data', 'stats.json');
const prev = existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')) : null;
const { changedAt: prevDate, ...prevData } = prev ?? {};
const unchanged = prev && JSON.stringify(prevData) === JSON.stringify(snapshot);
const today = unchanged ? prevDate : new Date().toISOString().slice(0, 10);
writeFileSync(statePath, JSON.stringify({ ...snapshot, changedAt: today }, null, 2) + '\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${defs()}${dotGrid('b', 22, 0.1)}</defs>
  <clipPath id="c"><rect width="${W}" height="${H}" rx="22"/></clipPath>
  <g clip-path="url(#c)">
    <rect width="${W}" height="${H}" fill="${C.bg}"/>
    <rect width="520" height="${H}" fill="${C.surface}"/>
    <rect x="520" width="${W - 520}" height="${H}" fill="url(#b-dots)"/>
    <rect width="6" height="${H}" fill="url(#b-grad)"/>
  </g>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="22" fill="none" stroke="${C.border}" stroke-width="2"/>
  <line x1="520" y1="0" x2="520" y2="${H}" stroke="${C.border}" stroke-width="2"/>

  <text x="48" y="62" font-family="${FONT.mono}" font-size="15" letter-spacing="4" fill="${C.accent}">GITHUB STATS</text>
  <text x="46" y="104" font-family="${FONT.display}" font-weight="700" font-size="34" fill="${C.text}">@${esc(u.login)}</text>
  ${statRows}

  <text x="${PX}" y="62" font-family="${FONT.mono}" font-size="15" letter-spacing="4" fill="${C.muted}">CONTRIBUTIONS · LAST 12 MONTHS</text>
  ${months.join('')}
  ${cells.join('')}
  <text x="${legendX - 12}" y="281" text-anchor="end" font-family="${FONT.mono}" font-size="13" fill="${C.muted}">Less</text>
  ${legend}
  <text x="${legendX + 5 * (CELL + GAP) + 6}" y="281" font-family="${FONT.mono}" font-size="13" fill="${C.muted}">More</text>
  <text x="${PX}" y="314" font-family="${FONT.mono}" font-size="15" letter-spacing="4" fill="${C.muted}">LANGUAGES · OWN PUBLIC REPOS</text>
  ${langSvg}
  <text x="${PX}" y="414" font-family="${FONT.mono}" font-size="13" fill="${C.muted}" fill-opacity=".8">Data as of ${today} · source: GitHub GraphQL API · checked daily by GitHub Actions</text>
</svg>`;

// ── compact vertical variant for phones (served via <picture media>) ──
const MW = 800, MCELL = 21, MGAP = 5, MWEEKS = 26;
const mWeeks = weeks.slice(-MWEEKS);
const mRows = rows.map(([label, value], i) => {
  const y = 176 + i * 66;
  return `
    <text x="48" y="${y}" font-family="${FONT.display}" font-size="30" fill="${C.muted}">${esc(label)}</text>
    <text x="${MW - 48}" y="${y + 2}" text-anchor="end" font-family="${FONT.mono}" font-weight="700" font-size="38" fill="${C.text}">${esc(value)}</text>
    ${i < rows.length - 1 ? `<line x1="48" y1="${y + 26}" x2="${MW - 48}" y2="${y + 26}" stroke="${C.border}" stroke-width="1.5"/>` : ''}`;
}).join('');
const MHY = 580;
const mCells = mWeeks.flatMap((w, wi) => w.contributionDays.map((d) =>
  `<rect x="${48 + wi * (MCELL + MGAP)}" y="${MHY + d.weekday * (MCELL + MGAP)}" width="${MCELL}" height="${MCELL}" rx="4" ${levelFill(d.contributionCount)}/>`)).join('');
const MH = MHY + 7 * (MCELL + MGAP) + 70;
const mobileSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${MW}" height="${MH}" viewBox="0 0 ${MW} ${MH}">
  <defs>${defs()}${dotGrid('b', 22, 0.1)}</defs>
  <clipPath id="c"><rect width="${MW}" height="${MH}" rx="24"/></clipPath>
  <g clip-path="url(#c)">
    <rect width="${MW}" height="${MH}" fill="${C.surface}"/>
    <rect y="${MHY - 76}" width="${MW}" height="${MH}" fill="${C.bg}"/>
    <rect y="${MHY - 76}" width="${MW}" height="${MH}" fill="url(#b-dots)"/>
    <rect width="${MW}" height="6" fill="url(#b-grad)"/>
  </g>
  <rect x="1" y="1" width="${MW - 2}" height="${MH - 2}" rx="24" fill="none" stroke="${C.border}" stroke-width="2"/>
  <text x="48" y="66" font-family="${FONT.mono}" font-size="20" letter-spacing="5" fill="${C.accent}">GITHUB STATS</text>
  <text x="46" y="114" font-family="${FONT.display}" font-weight="700" font-size="42" fill="${C.text}">@${esc(u.login)}</text>
  ${mRows}
  <text x="48" y="${MHY - 26}" font-family="${FONT.mono}" font-size="19" letter-spacing="4" fill="${C.muted}">CONTRIBUTIONS · LAST 6 MONTHS</text>
  ${mCells}
  <text x="48" y="${MH - 30}" font-family="${FONT.mono}" font-size="17" fill="${C.muted}">Data as of ${today} · GitHub GraphQL API</text>
</svg>`;

const bytes = renderAsset(svg, { pngPath: root('assets', 'stats.png'), width: W });
renderAsset(mobileSvg, { pngPath: root('assets', 'stats-mobile.png'), width: MW });
console.log(`assets/stats.png ${(bytes / 1024).toFixed(0)} KB (+ stats-mobile.png) — repos=${u.repositories.totalCount} contributions=${cal.totalContributions} contributedTo=${u.repositoriesContributedTo.totalCount}`);
