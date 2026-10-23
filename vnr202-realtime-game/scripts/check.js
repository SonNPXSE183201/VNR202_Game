const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const dirs = ['src', 'public', 'scripts', 'test'];
const files = ['server.js', ...dirs.flatMap(dir => fs.readdirSync(dir).filter(f => f.endsWith('.js')).map(f => path.join(dir, f)))];
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status) { console.error(result.stderr); process.exit(1); }
}
console.log(`Syntax PASS: ${files.length} JavaScript files. Buildless app: no compile step. No TypeScript; typecheck not applicable.`);
