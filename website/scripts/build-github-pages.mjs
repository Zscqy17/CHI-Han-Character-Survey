import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, relative, join } from 'node:path';

// Empty for an owner.github.io site, or /repository-name for a project site.
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '/CHI-Han-Character-Survey').replace(/\/$/, '');
if (basePath && !/^\/[A-Za-z0-9._-]+$/.test(basePath)) {
  throw new Error('NEXT_PUBLIC_BASE_PATH must be empty or /repository-name.');
}
const project = resolve(import.meta.dirname, '..');
const result = spawnSync('npm', ['run', 'build'], {
  cwd: project,
  stdio: 'inherit',
  env: { ...process.env, NEXT_PUBLIC_BASE_PATH: basePath },
});
if (result.status !== 0) process.exit(result.status ?? 1);

const source = join(project, 'dist/client');
const destination = join(project, 'dist/github-pages');
rmSync(destination, { recursive: true, force: true });
cpSync(source, destination, { recursive: true });
// Vinext emits prefixed framework assets under a matching physical directory.
// The GitHub project mount supplies that prefix, so publish its contents at root.
if (basePath) {
  const prefixedAssets = join(destination, basePath.slice(1));
  if (existsSync(prefixedAssets)) {
    for (const entry of readdirSync(prefixedAssets)) {
      cpSync(join(prefixedAssets, entry), join(destination, entry), { recursive: true });
    }
    rmSync(prefixedAssets, { recursive: true });
  }
}
const papers = JSON.parse(readFileSync(join(project, 'data/papers.json'), 'utf8'));
const routes = ['algorithms', 'interaction', ...papers.map(p => `papers/${p.id}`)];
for (const route of routes) {
  const html = readFileSync(join(source, `${route}.html`));
  mkdirSync(join(destination, route), { recursive: true });
  writeFileSync(join(destination, route, 'index.html'), html);
}
writeFileSync(join(destination, '.nojekyll'), '');

// Check every exported route and every local HTML src/href before publishing.
let references = 0;
function verifyHtml(file) {
  const html = readFileSync(file, 'utf8');
  for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    const value = match[1].replaceAll('&amp;', '&');
    if (/^(https?:|data:|mailto:|#)/.test(value)) continue;
    const url = new URL(value, `https://example.invalid${basePath}/${relative(destination, file)}`);
    if (basePath && !url.pathname.startsWith(`${basePath}/`)) {
      throw new Error(`Unprefixed link in ${relative(destination, file)}: ${value}`);
    }
    const local = join(destination, decodeURIComponent(url.pathname.slice(basePath.length)));
    if (!existsSync(local) && !existsSync(`${local}.html`)) {
      throw new Error(`Missing local target in ${relative(destination, file)}: ${value}`);
    }
    references++;
  }
}
function visit(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) visit(file);
    else if (entry.name.endsWith('.html')) verifyHtml(file);
  }
}
visit(destination);
const report = { basePath, papers: papers.length, directoryRoutes: routes.length, localReferences: references, output: 'dist/github-pages' };
writeFileSync(join(destination, 'deployment.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
