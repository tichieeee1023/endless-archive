require('./test-p4.cjs');
const { test, assert, useRun, run, localRequire, resolveRunEndings, persistenceOptions } = require('./test-p1.cjs');
const { useMeta } = localRequire('./src/store/useMeta.js');
const { autoBattleAction, skillCost, potionHeal, evadeChance, willReduction } = localRequire('./src/lib/combat.js');
const { closestBond } = localRequire('./src/lib/defeat.js');
const { spawnEnemy } = localRequire('./src/data/enemies.js');
const { rollBattleOpening } = localRequire('./src/lib/check.js');
const { getEndingArt } = localRequire('./src/data/artLibrary.js');
const { ENDING_CATALOG } = localRequire('./src/data/endings.js');
const fixed = (fn, value = 0.5) => { const random = Math.random; Math.random = () => value; try { return fn(); } finally { Math.random = random; } };
function battle(npc, affinity, act=1, boss=false, hp=1) {
  run().startRun('balance');
  useRun.setState({ act, floor:boss?8:3, hp, gold:101, status:'battle', current:{type:boss?'boss':'battle',id:'test',title:'test',preview:''}, affinity:{rael:0,seon:0,kairu:0,[npc]:affinity}, battle:{enemy:{id:'test',name:boss&&act===3?'이야기의 끝 — 마지막 장':'test',hp:999,maxHp:999,atk:50,exp:100,gold:100},turn:1,log:[]} });
}
for (const npc of ['rael','seon','kairu']) {
  test(`${npc}: mid-run rescue is once only, without XP or loot`, () => {
    battle(npc,8); const oldExp=run().exp;
    fixed(()=>run().playerAttack());
    assert.equal(run().nodeResult.rescued,true); assert.equal(run().nodeResult.endsRun,undefined);
    assert.equal(run().hp,24); assert.equal(run().gold,50); assert.equal(run().exp,oldExp);
    assert.ok(run().flags.includes(`rescued_${npc}`));
    const oldFlags=run().flags.slice(); run().advanceFloor(); assert.equal(run().floor,4);
    const previous=run(); battle(npc,30); useRun.setState({flags:oldFlags, floor:previous.floor});
    fixed(()=>run().playerSkill()); assert.equal(run().nodeResult.endsRun,'death'); assert.equal(run().hp,0);
  });
  test(`${npc}: final defeat yields its own non-romantic ending with finished routes preserved`, () => {
    battle(npc,12,3,true); useRun.setState({flags:['rescued_rael','route_seon_happy','romance_seon_promise']});
    fixed(()=>run().playerSkill()); assert.equal(run().nodeResult.endsRun,'defeat'); assert.equal(run().hp,0);
    run().advanceFloor(); assert.equal(run().status,'ended');
    const ending=resolveRunEndings(run().flags,false); assert.equal(ending.journey.id,`${npc}_defeat`);
    assert.deepEqual(ending.routes.map(x=>x.id),['seon_route_happy']); assert.equal(ending.bonuses[0].id,'seon_romance');
    assert.ok(ENDING_CATALOG.some(x=>x.id===ending.journey.id)); assert.ok(getEndingArt(ending.journey.id));
    assert.equal(resolveRunEndings([`final_defeat_${npc}`],true).journey.id,'solo');
  });
}
test('affinity thresholds, deterministic ties, and low-affinity final defeat',()=>{
  assert.equal(closestBond({rael:12,seon:12,kairu:12}).npc,'rael');
  battle('rael',7); fixed(()=>run().playerAttack()); assert.equal(run().nodeResult.endsRun,'death');
  battle('rael',11,3,true); fixed(()=>run().playerAttack()); assert.equal(run().nodeResult.endsRun,'death');
  assert.equal(resolveRunEndings(run().flags,false).journey.id,'death');
});
test('early boss rescue advances the act but never awards a victory or XP',()=>{
  battle('seon',8,2,true); fixed(()=>run().playerAttack()); assert.equal(run().exp,0); run().advanceFloor(); assert.equal(run().status,'interlude'); assert.equal(run().act,3);
});
test('potions do not consume turns or trigger enemy counters; manual/auto gates work',()=>{
  battle('rael',0,1,false,10); useRun.setState({healthPotions:2,focusPotions:2,mp:1,autoBattle:false});
  run().useHealingPotion(); assert.equal(run().hp,26); assert.equal(run().battle.turn,1); assert.equal(run().healthPotions,1);
  run().useFocusPotion(); assert.equal(run().mp,9); assert.equal(run().battle.turn,1);
  useRun.setState({autoBattle:true}); run().useHealingPotion(); assert.equal(run().hp,26);
  run().autoHealingPotion(); assert.equal(run().hp,42); assert.equal(run().healthPotions,0);
});
test('auto prioritizes lethal attack, brace, health potion, focus potion and appropriate skill',()=>{
  battle('rael',0,3,true,1); useRun.setState({healthPotions:1,focusPotions:1,mp:1});
  let s=run(); assert.equal(autoBattleAction(s.battle,s),'potion');
  assert.equal(autoBattleAction({...s.battle,turn:3},s),'brace');
  assert.equal(autoBattleAction({...s.battle,enemy:{...s.battle.enemy,hp:1},turn:3},s),'attack');
  useRun.setState({hp:60}); s=run(); // high enemy attack still survivable
  assert.equal(autoBattleAction(s.battle,s),'focusPotion');
  useRun.setState({mp:40}); s=run(); assert.equal(autoBattleAction(s.battle,s),'skill');
});
test('stats and boss tuning match configured formulas',()=>{
  assert.equal(skillCost(4),10); assert.equal(skillCost(6),9); assert.equal(skillCost(99),6);
  assert.equal(potionHeal(100,7),31); assert.equal(evadeChance(14),0.3); assert.equal(willReduction(10),7);
  assert.deepEqual([1,2,3].map(act=>{const e=spawnEnemy(5,'test',act,8,true);return [e.hp,e.atk]}),[[100,14],[155,18],[345,25]]);
  assert.equal(fixed(()=>rollBattleOpening(40,0,18,14),0.99).powerBonus,14);
});
test('new run resets rescue flags; old meta merge keeps historical counters; rescue is not death',()=>{
  battle('rael',12,3,true); fixed(()=>run().playerAttack()); run().startRun('fresh'); assert.deepEqual(run().flags,[]);
  const meta=useMeta.getState(); const merge=persistenceOptions['endless-archive-meta'].merge;
  const saved=merge({runCount:5,deaths:3,victories:2,endings:['death']},meta);
  assert.equal(saved.defeats,0); assert.equal(saved.deaths,3); assert.deepEqual(saved.endings,['death']);
  useMeta.setState({runCount:5,deaths:3,victories:2,defeats:0}); useMeta.getState().addRun('defeat');
  assert.equal(useMeta.getState().runCount,6); assert.equal(useMeta.getState().deaths,3); assert.equal(useMeta.getState().defeats,1);
});
test('saved rescue flags and node results survive the existing v13 partialize contract',()=>{
  battle('kairu',12,3,true); fixed(()=>run().playerAttack());
  const saved=JSON.parse(JSON.stringify(persistenceOptions['endless-archive-run'].partialize(run())));
  assert.equal(saved.nodeResult.endsRun,'defeat'); assert.ok(saved.flags.includes('final_defeat_kairu'));
  assert.equal(resolveRunEndings(saved.flags,false).journey.id,'kairu_defeat');
});
