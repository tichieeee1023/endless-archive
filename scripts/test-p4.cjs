// P4 UI and catalog integration checks. P1–P3 regressions run first.
require('./test-p3.cjs');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { test, assert, choose, run, useRun, localRequire } = require('./test-p1.cjs');
const { ENDING_CATALOG } = localRequire('./src/data/endings.js');
const { endingProgress, routeCatalogFor, bonusCatalogFor, legacyCollected } = localRequire('./src/lib/archiveView.js');

const project = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(project, name), 'utf8');

test('P4 collection progress distinguishes journey, NPC stories and bonus endings without double-counting legacy', () => {
  assert.deepEqual(endingProgress([]), { collected: 0, total: 15 });
  assert.deepEqual(endingProgress([], 'journey'), { collected: 0, total: 3 });
  assert.deepEqual(endingProgress([], 'route'), { collected: 0, total: 9 });
  assert.deepEqual(endingProgress([], 'bonus'), { collected: 0, total: 3 });
  const saved = ['rael_route_happy', 'rael_route_happy', 'rael_romance', 'solo', 'rael_end'];
  assert.deepEqual(endingProgress(saved), { collected: 3, total: 15 });
  assert.deepEqual(endingProgress(saved, 'route'), { collected: 1, total: 9 });
  assert.deepEqual(endingProgress(saved, 'bonus'), { collected: 1, total: 3 });
  assert.deepEqual(legacyCollected(saved).map((x) => x.id), ['rael_end']);
});

test('P4 groups all nine story outcomes by character and grade; each optional bonus remains separate', () => {
  for (const npc of ['rael', 'seon', 'kairu']) {
    const routes = routeCatalogFor(npc);
    assert.deepEqual(routes.map((x) => x.id), ['bad', 'normal', 'happy'].map((grade) => `${npc}_route_${grade}`));
    assert.ok(routes.every((x) => x.kind === 'route'));
    assert.equal(bonusCatalogFor(npc).id, `${npc}_romance`);
    assert.equal(bonusCatalogFor(npc).kind, 'bonus');
  }
  assert.equal(new Set(ENDING_CATALOG.map((item) => item.id)).size, ENDING_CATALOG.length);
});

test('P4 outcome effects display actual resources after clamping, and preserve game results', () => {
  run().startRun('p4-effects');
  useRun.setState({ hp: 54, mp: 39, gold: 0 });
  choose('train_seat_owner', 0);
  assert.equal(run().gold, 14);
  assert.deepEqual(run().encounterOutcome.effects, ['골드 +14']);
  assert.ok(run().logs.at(-1).text.includes('골드 +14'));
  choose('train_missing_minute', 1);
  assert.equal(run().hp, 60);
  assert.deepEqual(run().encounterOutcome.effects, ['체력 +6']);
  choose('train_letter_echo', 0);
  assert.equal(run().mp, 40);
  assert.deepEqual(run().encounterOutcome.effects, ['내공 +1']);
});

test('P4 shows actual negative resource changes and does not add phantom losses below minimum', () => {
  run().startRun('p4-negative');
  useRun.setState({ hp: 1, mp: 0, gold: 0 });
  choose('train_seat_owner', 0);
  assert.equal(run().hp, 1);
  assert.ok(run().encounterOutcome.effects.every((item) => !item.includes('체력 -')));
});

test('P4 dialog components transpile without syntax errors (including JSX)', () => {
  for (const name of [
    'src/components/ArchiveModal.tsx', 'src/components/EndingScreen.tsx',
    'src/components/EndingRecallModal.tsx', 'src/components/EventModal.tsx',
  ]) {
    const result = ts.transpileModule(read(name), { fileName: name, compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022,
    }, reportDiagnostics: true });
    assert.equal((result.diagnostics || []).filter((x) => x.category === ts.DiagnosticCategory.Error).length, 0, name);
  }
});

test('P4 keeps encounter and relationship prose as in P3, with existing art untouched', () => {
  const { createHash } = require('node:crypto');
  const digest = createHash('sha256').update(fs.readFileSync(path.join(project, 'src/data/memories.ts'))).digest('hex');
  assert.equal(digest, '3e9463574c914dc2d869b5d945e4c5a99e5fec7812fef2d5cc7b208c51d923f0');
  for (const name of ['rael.png','seon.png','kairu.png','archive.png'])
    assert.ok(fs.statSync(path.join(project,'src/assets/illustrations',name)).size > 10000);
});
