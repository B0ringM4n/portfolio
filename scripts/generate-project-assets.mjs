import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const rootDirectory = join(dirname(fileURLToPath(import.meta.url)), '..');

const projects = [
  { slug: 'atlas-commerce', tones: ['#0b352d', '#d7ff56', '#f5f3ea'], label: 'ATLAS / COMMERCE' },
  { slug: 'mono-culture', tones: ['#241f1a', '#f1b4c8', '#f4efe6'], label: 'MONO / CULTURE' },
  { slug: 'nexo-finance', tones: ['#152238', '#85c7f2', '#eef1f5'], label: 'NEXO / FINANCE' },
];

const escapeXml = (value) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
})[character]);

export function renderFrame(project, index, width, height) {
  const [base, accent, paper] = project.tones;
  const gutter = Math.round(width * 0.055);
  const panelX = gutter + ((index % 2) * Math.round(width * 0.075));
  const panelY = Math.round(height * (index === 0 ? 0.19 : 0.15));
  const panelWidth = Math.round(width * (index === 0 ? 0.69 : 0.58));
  const panelHeight = Math.round(height * (index === 0 ? 0.62 : 0.68));
  const smallPanelX = panelX + Math.round(panelWidth * 0.09);
  const smallPanelY = panelY + Math.round(panelHeight * 0.15);
  const smallPanelWidth = Math.round(panelWidth * 0.49);
  const smallPanelHeight = Math.round(panelHeight * 0.46);
  const productX = panelX + Math.round(panelWidth * 0.62);
  const productY = panelY + Math.round(panelHeight * 0.22);
  const productSize = Math.round(Math.min(panelWidth, panelHeight) * 0.29);
  const gridX = Array.from({ length: 10 }, (_, column) => gutter + column * ((width - gutter * 2) / 9));
  const gridY = Array.from({ length: 7 }, (_, row) => gutter + row * ((height - gutter * 2) / 6));
  const gridLines = [
    ...gridX.map((x) => `<line x1="${x}" y1="${gutter}" x2="${x}" y2="${height - gutter}" />`),
    ...gridY.map((y) => `<line x1="${gutter}" y1="${y}" x2="${width - gutter}" y2="${y}" />`),
  ].join('');
  const label = escapeXml(project.label);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
  <title id="title">${label}</title>
  <desc id="description">Composición geométrica original para ${label}</desc>
  <rect width="${width}" height="${height}" fill="${base}"/>
  <g stroke="${paper}" stroke-opacity="0.18" stroke-width="1">${gridLines}</g>
  <rect x="${panelX}" y="${panelY}" width="${panelWidth}" height="${panelHeight}" rx="${Math.round(width * 0.018)}" fill="${paper}"/>
  <rect x="${panelX}" y="${panelY}" width="${panelWidth}" height="${Math.round(panelHeight * 0.13)}" fill="${accent}"/>
  <circle cx="${panelX + Math.round(panelWidth * 0.055)}" cy="${panelY + Math.round(panelHeight * 0.065)}" r="${Math.round(width * 0.008)}" fill="${base}"/>
  <path d="M ${panelX + Math.round(panelWidth * 0.13)} ${panelY + Math.round(panelHeight * 0.065)} h ${Math.round(panelWidth * 0.3)}" stroke="${base}" stroke-width="${Math.max(4, Math.round(width * 0.004))}" />
  <rect x="${smallPanelX}" y="${smallPanelY}" width="${smallPanelWidth}" height="${smallPanelHeight}" fill="${base}"/>
  <rect x="${smallPanelX + Math.round(smallPanelWidth * 0.1)}" y="${smallPanelY + Math.round(smallPanelHeight * 0.12)}" width="${Math.round(smallPanelWidth * 0.5)}" height="${Math.round(smallPanelHeight * 0.06)}" fill="${accent}"/>
  <rect x="${smallPanelX + Math.round(smallPanelWidth * 0.1)}" y="${smallPanelY + Math.round(smallPanelHeight * 0.28)}" width="${Math.round(smallPanelWidth * 0.74)}" height="${Math.round(smallPanelHeight * 0.025)}" fill="${paper}" fill-opacity="0.8"/>
  <rect x="${smallPanelX + Math.round(smallPanelWidth * 0.1)}" y="${smallPanelY + Math.round(smallPanelHeight * 0.39)}" width="${Math.round(smallPanelWidth * 0.62)}" height="${Math.round(smallPanelHeight * 0.025)}" fill="${paper}" fill-opacity="0.5"/>
  <circle cx="${productX + productSize / 2}" cy="${productY + productSize / 2}" r="${productSize / 2}" fill="${accent}"/>
  <path d="M ${productX + productSize * 0.26} ${productY + productSize * 0.58} C ${productX + productSize * 0.44} ${productY + productSize * 0.18}, ${productX + productSize * 0.7} ${productY + productSize * 0.24}, ${productX + productSize * 0.76} ${productY + productSize * 0.55}" fill="none" stroke="${base}" stroke-width="${Math.max(7, Math.round(width * 0.008))}" stroke-linecap="round"/>
  <rect x="${productX}" y="${productY + Math.round(productSize * 1.18)}" width="${Math.round(productSize * 0.82)}" height="${Math.round(productSize * 0.11)}" fill="${base}"/>
  <text x="${gutter}" y="${height - gutter}" fill="${paper}" font-family="Arial, sans-serif" font-size="${Math.max(24, Math.round(width * 0.024))}" font-weight="700" letter-spacing="2">${label}</text>
</svg>`;
}

async function generateProject(project) {
  const projectDirectory = join(rootDirectory, 'src', 'assets', 'projects', project.slug);
  const frames = [
    { filename: 'cover.webp', index: 0, width: 1600, height: 1000 },
    { filename: 'gallery-01.webp', index: 1, width: 1600, height: 1200 },
    { filename: 'gallery-02.webp', index: 2, width: 1600, height: 1200 },
    { filename: 'gallery-03.webp', index: 3, width: 1600, height: 1200 },
  ];

  await mkdir(projectDirectory, { recursive: true });
  await Promise.all(frames.map(async (frame) => {
    const svg = renderFrame(project, frame.index, frame.width, frame.height);
    await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(join(projectDirectory, frame.filename));
  }));

  return frames.length;
}

async function main() {
  const counts = await Promise.all(projects.map(generateProject));
  console.log(`Generated ${counts.reduce((total, count) => total + count, 0)} original project WebP assets.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
