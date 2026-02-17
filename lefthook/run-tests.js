const { execSync } = require('child_process');

const services = [
  'wm-rajar-ms_writer/BACK',
  'wm-rajar-ms_writer/FRONT',
  'wn-rajar-ms_reader/Backend',
  'wn-rajar-ms_reader/Frontend',
];

for (const service of services) {
  console.log(`Running tests in ${service}...`);
  execSync('npm test', { stdio: 'inherit', cwd: service });
}
