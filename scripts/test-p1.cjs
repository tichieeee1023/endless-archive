// P1 regression tests. Requires only TypeScript (already in devDependencies).
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { createRequire } = require('node:module');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'endless-archive-p1-'));
fs.writeFileSync(path.join(tmp, 'package.json'), '{"type":"commonjs"}');
process.on('exit', () => fs.rmSync(tmp, { recursive: true, force: true }));
for (const file of [
  'src/lib/ending.ts', 'src/lib/storyProgress.ts', 'src/lib/encounterChoice.ts',
  'src/data/encounters.ts', 'src/data/memories.ts', 'src/data/endings.ts',
  'src/store/useRun.ts', 'src/store/useSaveSlots.ts',
  'src/lib/mapgen.ts', 'src/lib/rng.ts', 'src/lib/check.ts',
  'src/lib/encounterPool.ts', 'src/data/independentEncounters.ts',
  'src/lib/bond.ts', 'src/lib/archiveView.ts', 'src/data/enemies.ts', 'src/data/prologue.ts',
]) {
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
const { resolveRunEndings, resolveRouteEndings } = localRequire('./src/lib/ending.js');
const { ENCOUNTERS } = localRequire('./src/data/encounters.js');
const { ENDING_CATALOG } = localRequire('./src/data/endings.js');
const { isChoiceAvailable } = localRequire('./src/lib/encounterChoice.js');
const { migrateStoryProgress } = localRequire('./src/lib/storyProgress.js');
const byId = (id) => ENCOUNTERS.find((e) => e.id === id);
const stats = { wisdom: 4, insight: 4, will: 4, resonance: 4, body: 4, charm: 4 };
const actors = ['rael', 'seon', 'kairu'];

for (const npc of actors) {
  test(`${npc}: BAD / NORMAL / HAPPY each work without any romance or bond flags`, () => {
    for (const grade of ['bad', 'normal', 'happy']) {
      const res = resolveRunEndings([`route_${npc}_${grade}`], true);
      assert.equal(res.journey.id, 'solo');
      assert.deepEqual(res.routes.map((r) => r.id), [`${npc}_route_${grade}`]);
      assert.equal(res.bonuses.length, 0);
    }
  });
  test(`${npc}: relationship bonus is explicit and additive`, () => {
    const result = resolveRunEndings([`route_${npc}_happy`, `romance_${npc}_promise`], true);
    assert.equal(result.routes[0].id, `${npc}_route_happy`);
    assert.equal(result.bonuses[0].id, `${npc}_romance`);
    assert.equal(result.journey.id, 'solo');
    assert.equal(resolveRunEndings([`romance_${npc}_promise`], true).bonuses.length, 0);
    assert.equal(resolveRunEndings([`route_${npc}_normal`, `romance_${npc}_promise`], true).bonuses.length, 0);
    assert.equal(resolveRunEndings([`bond_${npc}_1`, `bond_${npc}_2`], true).bonuses.length, 0);
  });
}

test('NPC BAD can coexist with death; journey is not the route', () => {
  const res = resolveRunEndings(['route_rael_bad', 'route_seon_happy'], false);
  assert.equal(res.journey.id, 'death');
  assert.deepEqual(res.routes.map((r) => r.id), ['rael_route_bad', 'seon_route_happy']);
});

test('several routes complete in one run, with just one journey ending', () => {
  const flags = ['route_rael_normal', 'route_seon_bad', 'route_kairu_happy'];
  assert.equal(resolveRunEndings(flags, true).routes.length, 3);
  assert.equal(resolveRunEndings(flags, true).journey.id, 'solo');
});

test('true_end uses all three story HAPPY outcomes, not legacy romance endings', () => {
  const all = actors.map((id) => `route_${id}_happy`);
  assert.equal(resolveRunEndings(all, true).journey.id, 'true_end');
  assert.equal(resolveRunEndings(['route_rael_happy'], true, ['seon_route_happy', 'kairu_route_happy']).journey.id, 'true_end');
  assert.equal(resolveRunEndings([], true, ['rael_end','seon_end','kairu_end']).journey.id, 'solo');
  assert.equal(resolveRunEndings(all, false).journey.id, 'death');
});

test('all event IDs are unique; every chained target exists', () => {
  const ids = ENCOUNTERS.map((e) => e.id);
  assert.equal(ids.length, new Set(ids).size);
  for (const enc of ENCOUNTERS) for (const choice of enc.choices) {
    for (const outcome of [choice.result, choice.fail].filter(Boolean)) {
      if (outcome.nextId) assert.ok(byId(outcome.nextId), `${enc.id} → ${outcome.nextId}`);
    }
  }
});

test('all three story chains now require story flags, not bond flags', () => {
  for (const [first,second,third,npc] of [
    ['rael_encounter_1','rael_encounter_2','rael_encounter_3','rael'],
    ['seon_1','seon_2','seon_3','seon'],
    ['kairu_1','kairu_2','kairu_3','kairu'],
  ]) {
    assert.equal(byId(first).requiresAll, undefined);
    assert.deepEqual(byId(second).requiresAll, [`story_${npc}_met`]);
    assert.deepEqual(byId(third).requiresAll, [`story_${npc}_clue`]);
  }
});

test('multi-flag romance choice is enforced by both UI/store guard', () => {
  const romanticChoice = byId('rael_final').choices.at(-1);
  assert.equal(isChoiceAvailable(romanticChoice, ['rael_truth'], stats), false);
  assert.equal(isChoiceAvailable(romanticChoice, ['rael_walk_together'], stats), false);
  assert.equal(isChoiceAvailable(romanticChoice, ['rael_walk_together','rael_truth'], stats), false);
  assert.equal(isChoiceAvailable(romanticChoice, ['rael_walk_together','rael_truth','story_rael_exception'], stats), true);
});

test('kairu returns to book without chaining into the freedom scene', () => {
  const book = byId('kairu_3').choices[1].result;
  assert.ok(book.setFlags.includes('route_kairu_normal'));
  assert.equal(book.nextId, undefined);
  assert.equal(byId('kairu_final_choice').weight, 0);
});

test('route final choices can all lead to grade flags; romance is only a bonus choice', () => {
  for (const id of ['rael_final','seon_final_choice','kairu_final_choice']) {
    const flags = byId(id).choices.flatMap((c) => c.result.setFlags ?? []);
    assert.ok(flags.some((f) => f.endsWith('_happy')));
    assert.ok(flags.some((f) => f.endsWith('_normal')));
    assert.equal(flags.filter((f) => f.startsWith('romance_')).length, 1);
  }
});

test('P0 archive entries are retained as legacy; all newly emitted IDs are catalogued', () => {
  const ids = ENDING_CATALOG.map((e) => e.id);
  assert.equal(ids.length, new Set(ids).size);
  for (const id of ['rael_end', 'seon_end','kairu_end']) assert.equal(ENDING_CATALOG.find((e) => e.id === id)?.kind, 'legacy');
  for (const npc of actors) for (const name of ['route_bad','route_normal','route_happy','romance']) {
    assert.ok(ids.includes(`${npc}_${name}`), `${npc}_${name}`);
  }
});

test('v6 migration retains existing flags and backfills story progress conservatively', () => {
  const flags = migrateStoryProgress(['bond_rael_1', 'seon_end_confirmed','kairu_returned'], ['seon_1','seon_2']);
  assert.ok(flags.includes('story_rael_met'));
  assert.ok(flags.includes('story_seon_met'));
  assert.ok(flags.includes('story_seon_clue'));
  assert.ok(flags.includes('seon_end_confirmed'));
  assert.ok(flags.includes('kairu_returned'));
  assert.deepEqual(resolveRouteEndings(flags), []); // no invented grade from old data
});

// Simulate the real event store, not just the grade resolver.
const { useRun } = localRequire('./src/store/useRun.js');
const { __options: persistenceOptions } = localRequire('zustand/middleware');
const run = () => useRun.getState();
function choose(event, index, random = 0) {
  useRun.setState({ activeEncounter: event, encounterOutcome: null, status: 'rel' });
  const previousRandom = Math.random;
  Math.random = () => random;
  try { run().resolveEncounterChoice(index); }
  finally { Math.random = previousRandom; }
}

test('real store opens a main route after a refusal without requiring romance', () => {
  run().startRun('store-test-1');
  choose('rael_encounter_1', 2); // walks past him; negative affinity
  assert.ok(run().flags.includes('story_rael_met'));
  assert.ok(!run().flags.includes('bond_rael_1'));
  assert.ok(run().seenEncounters.includes('rael_encounter_1'));
  assert.ok(!byId('rael_encounter_2').requiresAll.some((f) => !run().flags.includes(f)));
  choose('rael_encounter_2', 0, 0.99); // deliberately fail the check
  assert.ok(run().flags.includes('story_rael_clue'));
  assert.ok(!run().flags.includes('bond_rael_2'));
  choose('rael_encounter_3', 3); // walks away
  assert.equal(resolveRunEndings(run().flags, true).routes[0].id, 'rael_route_bad');
});

test('real store reaches HAPPY without romance, and adds romance only on a deliberate choice', () => {
  run().startRun('store-test-2');
  useRun.setState({ flags: ['story_rael_met', 'story_rael_clue', 'story_rael_exception'] });
  choose('rael_encounter_3', 0, 0); // stat check succeeds
  assert.equal(run().encounterOutcome.nextId, 'rael_final');
  run().continueEncounter();
  assert.equal(run().activeEncounter, 'rael_final');
  choose('rael_final', 0);
  assert.equal(resolveRunEndings(run().flags, true).routes[0].id, 'rael_route_happy');
  assert.equal(resolveRunEndings(run().flags, true).bonuses.length, 0);

  run().startRun('store-test-3');
  useRun.setState({ flags: ['story_rael_met', 'story_rael_clue', 'story_rael_exception', 'rael_walk_together'] });
  choose('rael_encounter_3', 0, 0);
  run().continueEncounter();
  choose('rael_final', 2);
  assert.equal(resolveRunEndings(run().flags, true).routes[0].id, 'rael_route_happy');
  assert.equal(resolveRunEndings(run().flags, true).bonuses[0].id, 'rael_romance');
});

test('real store keeps returned-to-book kairu out of the stay-happy ending', () => {
  run().startRun('store-test-4');
  useRun.setState({ flags: ['story_kairu_met','story_kairu_clue'] });
  choose('kairu_3', 1, 0);
  assert.ok(run().flags.includes('kairu_returned'));
  assert.equal(run().encounterOutcome.nextId, undefined);
  assert.equal(resolveRunEndings(run().flags, true).routes[0].id, 'kairu_route_normal');
});

test('real persisted v7 migration can open previously seen encounters without inventing endings', () => {
  const persistence = persistenceOptions['endless-archive-run'];
  assert.equal(persistence.version, 7);
  const oldSave = {
    flags: ['seon_end_confirmed', 'bond_rael_1'],
    seenEncounters: ['seon_1','seon_2'],
    endingResult: { id: 'seon_end', npcId: 'seon', title: '귀향', text: 'old text' },
    endingRecorded: true,
  };
  const migrated = persistence.migrate(oldSave, 6);
  assert.ok(migrated.flags.includes('story_rael_met'));
  assert.ok(migrated.flags.includes('story_seon_clue'));
  assert.equal(migrated.endingResult.id, 'seon_end');
  assert.equal(migrated.endingRecorded, true);
  assert.deepEqual(resolveRouteEndings(migrated.flags), []);
});

// Reused by P2 integration checks; requiring this file also runs P1 regressions.
module.exports = { test, assert, byId, ENCOUNTERS, stats, actors, choose, run, useRun, resolveRunEndings, isChoiceAvailable, localRequire, persistenceOptions };
