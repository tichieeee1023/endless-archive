// P2 tests extend the actual store-based P1 regressions (no browser mocks required).
const {
  test, assert, byId, ENCOUNTERS, stats, actors, choose, run, useRun,
  resolveRunEndings, isChoiceAvailable,
} = require('./test-p1.cjs');

const story = (npc) => `story_${npc}_clue`;
const route = (npc) => resolveRunEndings(run().flags, true).routes.find((e) => e.npcId === npc);
const bonuses = () => resolveRunEndings(run().flags, true).bonuses;

const BRIDGES = {
  rael: ['rael_registry', 'story_rael_exception'],
  seon: ['seon_signal', 'story_seon_signal'],
  kairu: ['kairu_colophon', 'story_kairu_authorship'],
};

for (const npc of actors) {
  test(`${npc}: optional evidence unlocks only after the main story clue and becomes unavailable after the route`, () => {
    const [id, evidence] = BRIDGES[npc];
    const event = byId(id);
    assert.ok(event);
    assert.equal(event.minAct, 2);
    assert.deepEqual(event.requiresAll, [story(npc)]);
    for (const grade of ['bad', 'normal', 'happy']) {
      assert.ok(event.requiresNone.includes(`route_${npc}_${grade}`));
    }
    assert.ok(event.choices.some((c) => c.result.setFlags?.includes(evidence)));
    assert.ok(event.choices.some((c) => !c.result.setFlags?.includes(evidence)));
    assert.ok(event.choices.length <= 3);
  });

  test(`${npc}: all stage 3 choices either finish the route or immediately open a final choice`, () => {
    const third = byId(npc === 'rael' ? 'rael_encounter_3' : `${npc}_3`);
    assert.ok(third);
    for (const ch of third.choices) {
      for (const out of [ch.result, ch.fail].filter(Boolean)) {
        assert.ok(out.nextId || out.setFlags?.some((f) => /^route_\w+_(bad|normal|happy)$/.test(f)),
          `${third.id} choice "${ch.text}" must not end without a resolution`);
      }
    }
    assert.ok(third.choices.length <= 4);
  });

  test(`${npc}: final choice has a non-romantic NORMAL fallback and evidence-gated HAPPY`, () => {
    const final = byId(npc === 'rael' ? 'rael_final' : npc === 'seon' ? 'seon_final_choice' : 'kairu_final_choice');
    const [_, evidence] = BRIDGES[npc];
    const happy = final.choices.find((c) => c.result.setFlags?.includes(`route_${npc}_happy`) && !c.result.setFlags?.some((f) => f.startsWith('romance_')));
    const normal = final.choices.find((c) => c.result.setFlags?.includes(`route_${npc}_normal`));
    const romantic = final.choices.find((c) => c.result.setFlags?.some((f) => f.startsWith('romance_')));
    assert.ok(happy && normal && romantic);
    assert.ok(happy.require.flagsAll?.includes(evidence));
    assert.ok(romantic.require.flagsAll?.includes(evidence));
    assert.equal(isChoiceAvailable(happy, [], stats), false);
    assert.equal(isChoiceAvailable(normal, [], stats), true);
    assert.equal(isChoiceAvailable(romantic, [evidence], stats), false);
  });
}

test('Rael: a distant player can find evidence and free him without romance', () => {
  run().startRun('p2-rael-happy');
  choose('rael_encounter_1', 2);
  choose('rael_encounter_2', 2);
  assert.ok(run().flags.includes('story_rael_clue'));
  choose('rael_registry', 0);
  choose('rael_encounter_3', 1);
  assert.equal(run().encounterOutcome.nextId, 'rael_final');
  run().continueEncounter();
  choose('rael_final', 0);
  assert.equal(route('rael').grade, 'happy');
  assert.equal(bonuses().length, 0);
  assert.ok(!run().flags.some((f) => f.startsWith('bond_rael_')));
});

test('Seon: the rescue signal yields a non-romantic HAPPY with the choice to go home', () => {
  run().startRun('p2-seon-happy');
  choose('seon_1', 2);
  choose('seon_2', 0, 0.99); // fail a check; his story still continues
  choose('seon_signal', 0);
  choose('seon_3', 1);
  assert.equal(run().encounterOutcome.nextId, 'seon_final_choice');
  run().continueEncounter();
  choose('seon_final_choice', 1);
  assert.equal(route('seon').grade, 'happy');
  assert.equal(bonuses().length, 0);
  assert.ok(!run().flags.some((f) => f.startsWith('bond_seon_')));
});

test('Kairu: self-authorship leads to non-romantic HAPPY', () => {
  run().startRun('p2-kairu-happy');
  choose('kairu_1', 2);
  choose('kairu_2', 1, 0.99); // fail a check; his story still continues
  choose('kairu_colophon', 1);
  choose('kairu_3', 2);
  assert.equal(run().encounterOutcome.nextId, 'kairu_final_choice');
  run().continueEncounter();
  choose('kairu_final_choice', 0);
  assert.equal(route('kairu').grade, 'happy');
  assert.equal(bonuses().length, 0);
  assert.ok(!run().flags.some((f) => f.startsWith('bond_kairu_')));
});

for (const [npc, third, checkChoice] of [
  ['rael','rael_encounter_3',0], ['seon','seon_3',0], ['kairu','kairu_3',0],
]) {
  test(`${npc}: failed final check produces an actual NORMAL instead of a softlock`, () => {
    run().startRun(`p2-${npc}-failed`);
    useRun.setState({ flags: [story(npc)] });
    choose(third, checkChoice, 0.99);
    assert.equal(run().encounterOutcome.nextId, undefined);
    assert.equal(route(npc).grade, 'normal');
    assert.ok(run().seenEncounters.includes(third));
  });
}

for (const [npc, third, badIndex] of [
  ['rael','rael_encounter_3',3], ['seon','seon_3',3], ['kairu','kairu_3',3],
]) {
  test(`${npc}: a destructive choice leads to BAD without ending the run`, () => {
    run().startRun(`p2-${npc}-bad`);
    useRun.setState({ flags: [story(npc)] });
    choose(third, badIndex);
    assert.equal(route(npc).grade, 'bad');
    assert.equal(run().status, 'rel');
    assert.equal(bonuses().length, 0);
  });
}

for (const [npc, third, bridge, bridgeIndex, thirdIndex, final, romanceIndex, relational] of [
  ['rael','rael_encounter_3','rael_registry',0,1,'rael_final',2,'rael_walk_together'],
  ['seon','seon_3','seon_signal',0,1,'seon_final_choice',2,'seon_find_home'],
  ['kairu','kairu_3','kairu_colophon',1,2,'kairu_final_choice',2,'kairu_asked'],
]) {
  test(`${npc}: romance is explicitly chosen, additive and not required for story HAPPY`, () => {
    run().startRun(`p2-${npc}-romance`);
    useRun.setState({ flags: [story(npc), relational] });
    choose(bridge, bridgeIndex);
    choose(third, thirdIndex);
    run().continueEncounter();
    assert.equal(run().activeEncounter, final);
    choose(final, romanceIndex);
    assert.equal(route(npc).grade, 'happy');
    assert.equal(bonuses().length, 1);
    assert.equal(bonuses()[0].id, `${npc}_romance`);
  });
}

test('new short clues neither add romance flags nor alter old collection IDs', () => {
  for (const [event] of Object.values(BRIDGES)) {
    const encounter = byId(event);
    for (const c of encounter.choices) {
      assert.equal(Boolean(c.result.setFlags?.some((f) => f.startsWith('romance_'))), false);
      assert.ok(encounter.text.length < 220, `${event} is too long for a brief text encounter`);
      assert.ok(c.result.text.length < 220, `${event} result is too long`);
    }
  }
  assert.ok(ENCOUNTERS.some((e) => e.id === 'train_letter'));
  assert.ok(ENCOUNTERS.some((e) => e.id === 'train_empty_seat'));
});


test('six existing special relationship scenes remain substantial and are not shortened like common encounters', () => {
  for (const id of ['rael_tea', 'rael_watch', 'seon_bandage', 'seon_home', 'kairu_name', 'kairu_promise']) {
    const encounter = byId(id);
    assert.ok(encounter, `${id} must remain available`);
    assert.ok(encounter.text.length >= 100, `${id}: preserve the dialogue-rich introduction`);
    assert.ok(encounter.choices.length >= 3, `${id}: preserve original choices`);
    assert.ok(encounter.choices.some((choice) => choice.result.text.length >= 100), `${id}: preserve the relationship scene payoff`);
  }
});
