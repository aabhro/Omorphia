import { build, transform } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const banner = `/*! Omorphia v${pkg.version} | MIT | https://github.com/aabhro/Omorphia */`;
rmSync('dist', { recursive: true, force: true });
mkdirSync('dist/css', { recursive: true });
const read = (file) => readFileSync(`src/css/${file}.css`, 'utf8');

// CSS: complete bundle and focused modules.
const order = ['tokens', 'base', 'edge', 'button', 'forms', 'nav', 'feedback', 'containers', 'advanced', 'overlays'];
const all = order.map(read).join('\n');
writeFileSync('dist/omorphia.css', `${banner}\n${all}`);
writeFileSync('dist/omorphia.min.css', `${banner}\n${(await transform(all, { loader: 'css', minify: true })).code}`);

const core = ['tokens', 'base', 'edge'].map(read).join('\n');
writeFileSync('dist/css/core.min.css', `${banner}\n${(await transform(core, { loader: 'css', minify: true })).code}`);
for (const module of order.slice(3)) {
  writeFileSync(`dist/css/${module}.min.css`, `${banner}\n${(await transform(read(module), { loader: 'css', minify: true })).code}`);
}

// JavaScript: classic global, complete ESM bundle, and individual ESM components.
const common = {
  bundle: true,
  banner: { js: banner },
  define: { __VERSION__: JSON.stringify(pkg.version) },
  target: ['es2022'],
  legalComments: 'none'
};
for (const min of [false, true]) {
  const suffix = min ? '.min' : '';
  await build({
    ...common,
    entryPoints: ['src/js/index.js'],
    format: 'iife',
    globalName: 'Omorphia',
    outfile: `dist/omorphia${suffix}.js`,
    minify: min
  });
  await build({
    ...common,
    entryPoints: ['src/js/index.js'],
    format: 'esm',
    outfile: `dist/omorphia.esm${suffix}.js`,
    minify: min
  });
}

const components = readdirSync('src/js/components').sort().map((file) => `src/js/components/${file}`);
await build({
  ...common,
  entryPoints: [...components, 'src/js/icons.js'],
  format: 'esm',
  splitting: true,
  outdir: 'dist/esm',
  chunkNames: 'chunks/[name]-[hash]',
  minify: true
});

// Integrity manifest for the public, canonical bundle names.
const sri = {};
for (const file of ['omorphia.min.css', 'omorphia.min.js', 'omorphia.esm.min.js']) {
  sri[file] = 'sha384-' + createHash('sha384').update(readFileSync(`dist/${file}`)).digest('base64');
}
writeFileSync('dist/sri.json', JSON.stringify({ name: 'Omorphia', version: pkg.version, files: sri }, null, 2) + '\n');

const kb = (file) => (readFileSync(file).length / 1024).toFixed(1) + ' kB';
console.log(`built Omorphia v${pkg.version}  css ${kb('dist/omorphia.min.css')}  js ${kb('dist/omorphia.min.js')}`);
