import { makeBadge } from 'badge-maker';
import fs from 'node:fs';

function getCoveragePercent(jsonPath) {
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const json = JSON.parse(raw);
  const score = json.total.lines.pct;
  if (Number.isNaN(score)) {
    console.error(`Invalid coverage score in ${jsonPath}`);
    process.exit(1);
  }
  return score;
}

const setColor = (value) => {
  if (value < 50) return '#e63946'; // rouge vif
  if (value < 80) return '#f4a261'; // orange vif / bien visible
  return '#2a9d8f'; // vert vif
};

const services = [
  { name: 'reader-back', path: 'reader/backend/coverage/coverage-summary.json' },
  { name: 'reader-front', path: 'reader/frontend/coverage/coverage-summary.json' },
  { name: 'writer-back', path: 'writer/backend/coverage/coverage-summary.json' },
  { name: 'writer-front', path: 'writer/frontend/coverage/coverage-summary.json' },
];

fs.mkdirSync('badges', { recursive: true });

// Génération des badges
for (const service of services) {
  const percent = getCoveragePercent(service.path);
  const badge = makeBadge({
    label: `${service.name} coverage`,
    message: `${percent}%`,
    color: setColor(percent),
  });
  fs.writeFileSync(`badges/coverage-${service.name}.svg`, badge);
  console.log(`✅ ${service.name}: ${percent}%`);
}

// mise à jour automatique du README ===
let readme = fs.readFileSync('README.md', 'utf-8');

const badgesMarkdown = services
  .map((s) => `![${s.name} coverage](badges/coverage-${s.name}.svg)`)
  .join(' ');

readme = readme.replace(
  /<!-- COVERAGE BADGES START -->[\s\S]*<!-- COVERAGE BADGES END -->/,
  `<!-- COVERAGE BADGES START -->\n${badgesMarkdown}\n<!-- COVERAGE BADGES END -->`,
);

fs.writeFileSync('README.md', readme);
console.log('README mis à jour avec les badges de coverage.');
