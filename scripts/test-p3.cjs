// P3 integration tests use the same real Zustand store logic as P1/P2, without browser dependencies.
require('./test-p2.cjs');
const {
  test, assert, byId, ENCOUNTERS, choose, run, useRun, localRequire,
  resolveRunEndings,
} = require('./test-p1.cjs');
const {
  eligibleEncounters, encounterWeight, pickWeightedEncounter,
} = localRequire('./src/lib/encounterPool.js');
const { generateChoices } = localRequire('./src/lib/mapgen.js');
const { INDEPENDENT_ENCOUNTERS } = localRequire('./src/data/independentEncounters.js');
const base = ['train_letter', 'train_empty_seat'];
const starting = [
  'train_wrong_ticket', 'train_reverse_schedule', 'train_spilled_ink', 'train_lost_luggage',
];
const followup = [
  ['train_letter_echo', 'letter_remembered', 2],
  ['train_seat_owner', 'seat_kept', 2],
  ['train_ticket_station', 'event_ticket_clue', 2],
  ['train_missing_minute', 'event_schedule_copied', 3],
];

test('P3 adds exactly ten standalone random events; all remain free of NPC/romance route requirements', () => {
  assert.equal(INDEPENDENT_ENCOUNTERS.length, 10);
  for (const encounter of INDEPENDENT_ENCOUNTERS) {
    assert.equal(encounter.npcId, undefined);
    assert.equal(encounter.kind, 'event');
    assert.ok(encounter.choices.length >= 2 && encounter.choices.length <= 3);
    assert.ok(encounter.text.length <= 170, `${encounter.id} must remain a brief event`);
    assert.ok((encounter.requiresAll || []).every(f => !/^(bond_|romance_|story_|route_)/.test(f)), encounter.id);
    for (const choice of encounter.choices) {
      for (const result of [choice.result, choice.fail].filter(Boolean)) {
        assert.ok(result.text.length < 175, `${encounter.id} result too long`);
        assert.ok(!(result.setFlags || []).some(f => /^(bond_|romance_|story_|route_)/.test(f)), encounter.id);
        assert.equal(result.affinity, undefined, `${encounter.id} must not raise NPC affection`);
      }
    }
  }
  for (const id of [...base, ...starting]) assert.ok(eligibleEncounters(ENCOUNTERS, 1, [], []).some(e => e.id === id), id);
});

test('P3 keeps the original two general events, six special romance encounters and all route endings', () => {
  for (const id of [...base, 'rael_tea', 'rael_watch', 'seon_bandage', 'seon_home', 'kairu_name', 'kairu_promise']) {
    assert.ok(byId(id));
  }
  for (const npc of ['rael', 'seon', 'kairu']) for (const grade of ['bad', 'normal', 'happy']) {
    assert.equal(resolveRunEndings([`route_${npc}_${grade}`], true).routes[0].grade, grade);
  }
});

for (const [id, flag, minAct] of followup) {
  test(`${id} is locked until a neutral action flag, then unlocks without dating`, () => {
    const ev = byId(id);
    assert.ok(ev);
    assert.deepEqual(ev.requiresAll, [flag]);
    assert.equal(ev.minAct, minAct);
    assert.equal(eligibleEncounters(ENCOUNTERS, minAct, [], []).some(e => e.id === id), false);
    assert.equal(eligibleEncounters(ENCOUNTERS, minAct - 1, [flag], []).some(e => e.id === id), false);
    assert.equal(eligibleEncounters(ENCOUNTERS, minAct, [flag], []).some(e => e.id === id), true);
    assert.equal(eligibleEncounters(ENCOUNTERS, minAct, [flag], [id]).some(e => e.id === id), false);
  });
}

test('two originally unused flags now open new storylets', () => {
  run().startRun('p3-followup-letter');
  choose('train_letter', 1);
  assert.ok(run().flags.includes('letter_remembered'));
  assert.ok(eligibleEncounters(ENCOUNTERS, 2, run().flags, run().seenEncounters).some(e => e.id === 'train_letter_echo'));
  choose('train_letter_echo', 0);
  assert.ok(run().flags.includes('event_letter_delivered'));
  assert.equal(run().affinity.rael, 0);
});

test('general encounter rewards actually change resources and are clamped', () => {
  run().startRun('p3-gain');
  useRun.setState({ gold: 0, hp: 54, mp: 36, maxHp: 60, maxMp: 40 });
  choose('train_seat_owner', 0);
  assert.equal(run().gold, 14);
  choose('train_missing_minute', 1);
  assert.equal(run().hp, 60);
  choose('train_letter_echo', 0);
  assert.equal(run().mp, 40);
  assert.equal(run().affinity.kairu, 0);
  assert.equal(run().flags.some(f => f.startsWith('romance_')), false);
});

test('stat-check failure consumes one-off event, charges capped penalty and does not reroll forever', () => {
  run().startRun('p3-fail');
  useRun.setState({ mp: 3, hp: 3 });
  choose('train_spilled_ink', 0, 0.99);
  assert.equal(run().mp, 0);
  assert.ok(run().flags.includes('event_manuscript_damaged'));
  assert.ok(run().seenEncounters.includes('train_spilled_ink'));
  assert.equal(eligibleEncounters(ENCOUNTERS, 1, run().flags, run().seenEncounters).some(e => e.id === 'train_spilled_ink'), false);
  choose('train_lost_luggage', 1, 0.99);
  assert.equal(run().hp, 1);
  assert.ok(run().seenEncounters.includes('train_lost_luggage'));
});

test('the outcome is paid only once when the encounter is continued', () => {
  run().startRun('p3-once');
  choose('train_wrong_ticket', 1);
  const reward = run().gold;
  assert.equal(reward, 8);
  run().continueEncounter();
  assert.equal(run().gold, reward);
  assert.ok(run().seenEncounters.includes('train_wrong_ticket'));
});

test('pursued NPC story chains have higher weight without becoming guaranteed', () => {
  assert.equal(encounterWeight(byId('rael_encounter_2')), 40);
  assert.equal(encounterWeight(byId('rael_encounter_1')), 15);
  assert.equal(encounterWeight(byId('train_ticket_station')), 30);
  const pool = eligibleEncounters(ENCOUNTERS, 1, [], []);
  const first = pickWeightedEncounter(ENCOUNTERS, 1, [], [], () => 0);
  const last = pickWeightedEncounter(ENCOUNTERS, 1, [], [], () => 0.9999);
  assert.ok(first && last && first !== last);
  assert.ok(pool.some(e => e.npcId === undefined));
  assert.ok(pool.some(e => e.npcId));
});

test('finished character stories no longer pop up as unresolved stage 3 encounters', () => {
  for (const [id, npc] of [['rael_encounter_3','rael'], ['seon_3','seon'], ['kairu_3','kairu']]) {
    assert.equal(eligibleEncounters(ENCOUNTERS, 3, [`story_${npc}_clue`], []).some(e => e.id === id), true);
    for (const grade of ['bad','normal','happy']) {
      assert.equal(eligibleEncounters(ENCOUNTERS, 3, [`story_${npc}_clue`, `route_${npc}_${grade}`], []).some(e => e.id === id), false);
    }
  }
});

test('map retains mandatory boss and scheduled event/shop/rest, while allowing more optional event routes', () => {
  for (let act = 1; act <= 3; act++) {
    for (const floor of [1, 3, 6]) assert.ok(generateChoices('p3-map', act, floor, 8).some(n => n.type === 'event'));
    assert.ok(generateChoices('p3-map', act, 4, 8).some(n => n.type === 'shop'));
    assert.ok(generateChoices('p3-map', act, 5, 8).some(n => n.type === 'rest'));
    assert.ok(generateChoices('p3-map', act, 8, 8).every(n => n.type === 'boss'));
  }
  let eventOffered = 0;
  let total = 0;
  for (let i = 0; i < 3000; i++) {
    const choice = generateChoices(`p3-seed-${i}`, 1, 2, 8);
    if (choice.some(n => n.type === 'event')) eventOffered++;
    total++;
  }
  assert.ok(eventOffered / total >= 0.74, `event offer rate ${(eventOffered / total).toFixed(3)} too low`);
});
