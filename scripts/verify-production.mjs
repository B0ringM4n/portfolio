import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const requirements = {
  routes: [
    'dist/index.html',
    'dist/404.html',
    'dist/projects/atlas-commerce/index.html',
    'dist/projects/mono-culture/index.html',
    'dist/projects/nexo-finance/index.html',
  ],
  homeSections: ['hero', 'statement', 'about', 'stack', 'projects', 'capabilities', 'contact'],
  projectCount: 3,
  technologyCount: 10,
  gradientSphereCount: 1,
  minimumGalleryItemsPerProject: 3,
};

const count = (html, pattern) => (html.match(pattern) ?? []).length;

const assertInOrder = (html, markers, label) => {
  let previousIndex = -1;
  for (const marker of markers) {
    const index = html.indexOf(marker);
    assert.ok(index > previousIndex, `${label}: ${marker} is missing or out of order`);
    previousIndex = index;
  }
};

const pages = new Map(
  requirements.routes.map((route) => {
    assert.ok(existsSync(route), `Missing production route: ${route}`);
    return [route, readFileSync(route, 'utf8')];
  }),
);

const home = pages.get('dist/index.html');
assert.ok(home, 'Missing production home page');

assertInOrder(
  home,
  requirements.homeSections.map((section) => `id="${section}"`),
  'Home narrative',
);

assert.equal(count(home, /data-project-card/g), requirements.projectCount, 'Project card count changed');
assert.equal(
  count(home, /data-tech-cell/g),
  requirements.technologyCount,
  'Technology cell count changed',
);
assert.equal(
  count(home, /data-gradient-sphere/g),
  requirements.gradientSphereCount,
  'Gradient sphere count changed',
);
assert.equal(count(home, /data-hero-line/g), 3, 'Hero must contain exactly three lines');
assert.equal(
  count(home, /class="capabilities-section__index"/g),
  6,
  'Capability count changed',
);
for (const [hook, expected] of [
  ['data-hero-line', 3],
  ['data-sphere', 1],
  ['data-reveal', 29],
  ['data-parallax', 3],
  ['data-magnetic', 6],
]) {
  assert.equal(count(home, new RegExp(hook, 'g')), expected, `${hook} count changed`);
}
assert.match(
  home,
  /<p class="projects-section__count"><span aria-hidden="true">03<\/span><span class="sr-only">3 proyectos<\/span><\/p>/,
  'Project count needs reliable assistive text',
);

const projectRoutes = requirements.routes.filter((route) => route.includes('/projects/'));
let galleryCount = 0;
for (const route of projectRoutes) {
  const html = pages.get(route);
  assert.ok(html, `Missing project output: ${route}`);
  const slug = route.match(/projects\/([^/]+)\//)?.[1];
  assert.ok(slug, `Cannot derive project slug from ${route}`);
  assert.equal(count(html, /<h1(?:\s|>)/g), 1, `${route} must have exactly one h1`);
  assertInOrder(
    html,
    [
      'data-project-hero',
      'data-project-question',
      'data-project-objective',
      'data-project-strategy',
      'class="gallery project-frame"',
      'data-project-outcome',
      'class="related-projects project-frame"',
      'id="contact"',
    ],
    route,
  );

  const galleryItems = html.match(/<figure[^>]*data-gallery-item[\s\S]*?<\/figure>/g) ?? [];
  const routeGalleryCount = galleryItems.length;
  assert.ok(
    routeGalleryCount >= requirements.minimumGalleryItemsPerProject,
    `${route} has ${routeGalleryCount} gallery items; expected at least ${requirements.minimumGalleryItemsPerProject}`,
  );
  for (const item of galleryItems) {
    assert.match(item, /<img[^>]*alt="[^"]+"[^>]*>/, `${route} has an empty gallery alt`);
    assert.match(item, /<img[^>]*loading="lazy"[^>]*>/, `${route} has a non-lazy gallery image`);
  }

  const relatedItems = html.match(/<article[^>]*data-related-project[\s\S]*?<\/article>/g) ?? [];
  assert.ok(relatedItems.length > 0, `${route} has no related projects`);
  assert.ok(relatedItems.length <= 3, `${route} has more than three related projects`);
  for (const item of relatedItems) {
    assert.doesNotMatch(item, new RegExp(`href="/projects/${slug}/"`), `${route} links to itself`);
  }
  galleryCount += routeGalleryCount;
}

for (const [route, html] of pages) {
  for (const [section, expected] of [
    ['about', 4],
    ['projects', 4],
    ['contact', 5],
  ]) {
    assert.equal(
      count(html, new RegExp(`href="/#${section}"`, 'g')),
      expected,
      `${route} shell link /#${section} count changed`,
    );
  }
  assert.doesNotMatch(html, /href="#(?:about|projects|contact)"/, `${route} has a page-local shell link`);
}

const allOutput = [...pages.values()].join('\n');
const incompleteTokens = [
  ['TO', 'DO'].join(''),
  ['T', 'BD'].join(''),
];
for (const token of incompleteTokens) {
  assert.doesNotMatch(allOutput, new RegExp(`\\b${token}\\b`, 'i'), `Incomplete-work token found: ${token}`);
}

for (const [route, html] of pages) {
  assert.doesNotMatch(html, /href\s*=\s*["']\s*["']/i, `${route} contains an empty href`);
  assert.doesNotMatch(html, /href\s*=\s*["']#\s*["']/i, `${route} contains href="#"`);
}

assert.equal(
  count(allOutput, /data-sphere(?:\s|=|>)/g),
  requirements.gradientSphereCount,
  'A second sphere marker was found',
);

const copiedOffBrandClientNames = [
  'Microsoft',
  'Microsoft Windows',
  'Trevor Noah',
  'Lando Norris',
  'Steven.com',
  'Steven Bartlett',
  'Vizcom',
  'Aether 1',
  'Bella Kitchenwear',
  'Bella Kitchenware',
  'Jasper',
  'Jasper.AI',
  'Slack',
  'Uplink',
  'Aptos Labs',
  'Webflow',
  'Webflow.com',
  'David Lee',
  'David Lee, Artist',
  'CMCC',
  'The Online School',
  'Totem.Earth',
  'Metacrafters',
];
const normalizedOutput = allOutput.toLocaleLowerCase('en');
for (const clientName of copiedOffBrandClientNames) {
  assert.ok(
    !normalizedOutput.includes(clientName.toLocaleLowerCase('en')),
    `Copied OFF+BRAND client name found: ${clientName}`,
  );
}

console.log(
  `Production verified: ${requirements.routes.length} routes, ${requirements.projectCount} projects, ${galleryCount} gallery items.`,
);
