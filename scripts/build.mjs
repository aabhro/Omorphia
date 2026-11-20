import { build, transform } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, basename } from 'node:path';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const banner = `/*! Edgelit v${pkg.version} | MIT | https://github.com/aabhro/edgelit */`;
rmSync('dist', { recursive: true, force: true }); mkdirSync('dist/css', { recursive: true });
const read = (f) => readFileSync(`src/css/${f}.css`, 'utf8');

// ---- CSS: bundle + per-module files
const order = ['tokens', 'base', 'edge', 'button', 'forms', 'nav', 'feedback', 'containers', 'advanced'];
const all = order.map(read).join('\n');
writeFileSync('dist/edgelit.css', `${banner}\n${all}`);
writeFileSync('dist/edgelit.min.css', `${banner}\n${(await transform(all, { loader: 'css', minify: true })).code}`);
const core = ['tokens', 'base', 'edge'].map(read).join('\n');
writeFileSync('dist/css/core.min.css', `${banner}\n${(await transform(core, { loader: 'css', minify: true })).code}`);
for (const m of order.slice(3)) writeFileSync(`dist/css/${m}.min.css`, `${banner}\n${(await transform(read(m), { loader: 'css', minify: true })).code}`);

// ---- JS: IIFE (global Edgelit), ESM bundle, and per-component ESM modules with shared chunks
const common = { bundle: true, banner: { js: banner }, define: { __VERSION__: JSON.stringify(pkg.version) }, target: ['es2022'], legalComments: 'none' };
for (const min of [false, true]) {
  const s = min ? '.min' : '';
  await build({ ...common, entryPoints: ['src/js/index.js'], format: 'iife', globalName: 'Edgelit', outfile: `dist/edgelit${s}.js`, minify: min });
  await build({ ...common, entryPoints: ['src/js/index.js'], format: 'esm', outfile: `dist/edgelit.esm${s}.js`, minify: min });
}
const comps = readdirSync('src/js/components').map((f) => `src/js/components/${f}`);
await build({ ...common, entryPoints: [...comps, 'src/js/icons.js'], format: 'esm', splitting: true, outdir: 'dist/esm', chunkNames: 'chunks/[name]-[hash]', minify: true });

// ---- SRI manifest
const sri = {};
for (const f of ['edgelit.min.css', 'edgelit.min.js', 'edgelit.esm.min.js']) sri[f] = 'sha384-' + createHash('sha384').update(readFileSync(`dist/${f}`)).digest('base64');
writeFileSync('dist/sri.json', JSON.stringify({ version: pkg.version, files: sri }, null, 2) + '\n');
const kb = (f) => (readFileSync(f).length / 1024).toFixed(1) + ' kB';
console.log(`built v${pkg.version}  css ${kb('dist/edgelit.min.css')}  js ${kb('dist/edgelit.min.js')}`);
