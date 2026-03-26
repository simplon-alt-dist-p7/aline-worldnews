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
  if (value < 25) return 'red';
  if (value < 40) return 'orange';
  return 'brightgreen';
};

const services = [
  { name: 'reader-back', path: 'reader/backend/coverage/coverage-summary.json' },
  { name: 'reader-front', path: 'reader/frontend/coverage/coverage-summary.json' },
  { name: 'writer-back', path: 'writer/backend/coverage/coverage-summary.json' },
  { name: 'writer-front', path: 'writer/frontend/coverage/coverage-summary.json' },
];

fs.mkdirSync('badges', { recursive: true });

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
