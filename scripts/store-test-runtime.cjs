// P1 regression tests. Requires only TypeScript (already in devDependencies).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { createRequire } = require('node:module');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'endless-archive-p1-'));
fs.writeFileSync(path.join(tmp, 'package.json'), '{"type":"commonjs"}');
process.on('exit', () => fs.rmSync(tmp, { recursive: true, force: true }));
for (const file of ['data', 'lib', 'store', 'types'].flatMap(dir => fs.readdirSync(path.join(root, 'src', dir)).filter(name => name.endsWith('.ts') && name !== 'audio.ts').map(name => `src/${dir}/${name}`))) {
  const input = fs.readFileSync(path.join(root, file), 'utf8');
  const transpiled = ts.transpileModule(input, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: file,
    reportDiagnostics: true,
  });
  const errors = (transpiled.diagnostics ?? []).filter((d) => d.category === ts.DiagnosticCategory.Error);
  assert.equal(errors.length, 0, `syntax error in ${file}`);
  const dest = path.join(tmp, file.replace(/\.ts$/, '.js'));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, transpiled.outputText);
}
// Minimal in-memory dependency stand-ins to exercise the real run-store functions.
// They do not replace the project's actual React/Zustand production dependencies.
const stub = (filename, source) => {
  const file = path.join(tmp, 'node_modules', filename);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, source);
};
stub('react/index.js', 'exports.useSyncExternalStore = () => true;');
stub('zustand/index.js', `exports.create = () => (initialize) => {
  let state;
  const set = (update) => {
    const patch = typeof update === 'function' ? update(state) : update;
    state = { ...state, ...patch };
  };
  const get = () => state;
  state = initialize(set, get, {});
  const store = () => state;
  store.getState = get;
  store.setState = set;
  store.persist = { hasHydrated: () => true, onFinishHydration: () => () => {} };
  return store;
};`);
stub('zustand/middleware/index.js', `const options = {};
exports.__options = options;
exports.persist = (initialize, config) => { options[config.name] = config; return initialize; };
exports.createJSONStorage = () => ({});`);
fs.mkdirSync(path.join(tmp, 'src/lib'), { recursive: true });
fs.writeFileSync(path.join(tmp, 'src/lib/audio.js'), 'exports.audio = { sfx: () => {} };');
const localRequire = createRequire(path.join(tmp, 'package.json'));
module.exports = { localRequire };
