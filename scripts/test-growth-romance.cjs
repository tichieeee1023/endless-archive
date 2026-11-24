require('./test-encounter-balance.cjs');
const { test, assert, useRun, run, localRequire, resolveRunEndings, persistenceOptions } = require('./test-p1.cjs');
const { ROMANCE_ENCOUNTERS } = localRequire('./src/data/romanceEncounters.js');
const { ENCOUNTERS } = localRequire('./src/data/encounters.js');
const { eligibleEncounters } = localRequire('./src/lib/encounterPool.js');
const { encounterDialogue, reunionOffer } = localRequire('./src/lib/companions.js');
const { counterFloor, worstCounter, openingStat, braceBonus, basicDamage, skillDamage, autoBattleAction } = localRequire('./src/lib/combat.js');
const { bondProtection } = localRequire('./src/lib/bond.js');
const { EXPANDED_STORY } = localRequire('./src/data/mainStory.js');
const stats={wisdom:4,insight:4,will:4,resonance:4,body:4,charm:4};
const zero={rael:0,seon:0,kairu:0};
const ids=['rael','seon','kairu'];
const fixed=(fn)=>{const old=Math.random;Math.random=()=>.5;try{return fn();}finally{Math.random=old;}};
test('wisdom contributes to skill damage but not basic damage; resonance has diminishing gains',()=>{
 assert.equal(skillDamage(stats,0),21); assert.equal(skillDamage({...stats,wisdom:14},0),31);
 assert.equal(basicDamage({...stats,wisdom:14},0),basicDamage(stats,0));
 assert.equal(skillDamage({...stats,wisdom:100},0),35);
 assert.ok(skillDamage({...stats,resonance:14},0)-skillDamage({...stats,resonance:4},0)>skillDamage({...stats,resonance:24},0)-skillDamage({...stats,resonance:14},0));
});
test('both attack styles contribute to opening and brace, no weapon/MP inflation',()=>{
 assert.equal(openingStat({...stats,resonance:15}),15); assert.equal(openingStat({...stats,body:17,resonance:15}),17);
 assert.ok(braceBonus({...stats,resonance:16},2)>braceBonus(stats,2));
 assert.ok(braceBonus({...stats,body:22},2)>braceBonus(stats,2));
});
test('final counter floor applies consistently to auto and actual attacks; BAD bonds do not protect',()=>{
 assert.equal(counterFloor(25,true),7); assert.equal(counterFloor(25,false),1);
 assert.equal(bondProtection({rael:100,seon:12,kairu:0},['route_rael_bad']),3);
 assert.equal(worstCounter(25,{...stats,will:100},0,zero,true),7);
 run().startRun('counter-floor');useRun.setState({status:'battle',hp:60,stats:{...stats,will:100},battle:{enemy:{id:'x',name:'이야기의 끝 — 마지막 장',hp:500,maxHp:500,atk:25,gold:0,exp:0},turn:1,log:[]}});
 fixed(()=>run().playerAttack()); assert.equal(run().hp,53);
 const s=run();assert.equal(autoBattleAction(s.battle,{...s,hp:7,healthPotions:1}),'potion');
});
test('auto saves MP on lethal basic attack and drinks if even a small heal can help',()=>{
 run().startRun('auto-precision');const s=run(); const b={enemy:{id:'x',name:'test',hp:1,maxHp:1,atk:100,gold:0,exp:0},turn:1,log:[]};
 assert.equal(autoBattleAction(b,s),'attack');
 assert.equal(autoBattleAction({...b,enemy:{...b.enemy,hp:500}}, {...s,hp:s.maxHp-1,healthPotions:1}),'potion');
});
test('six romance scenes are explicitly gated, no stat, HP, MP, gold, or affinity reward',()=>{
 assert.equal(ROMANCE_ENCOUNTERS.length,6);
 for(const e of ROMANCE_ENCOUNTERS){ const npc=e.npcId; const flags=[`route_${npc}_happy`,`romance_${npc}_promise`];
  assert.ok(eligibleEncounters(ENCOUNTERS,3,flags,[],'unnamed_station',zero).includes(e));
  assert.ok(!eligibleEncounters(ENCOUNTERS,3,[flags[0]],[],'unnamed_station',{rael:100,seon:100,kairu:100}).includes(e));
  assert.ok(!eligibleEncounters(ENCOUNTERS,3,[...flags,`route_${npc}_bad`],[],'unnamed_station',zero).includes(e));
  assert.ok(!eligibleEncounters(ENCOUNTERS,3,flags,[e.id],'unnamed_station',zero).includes(e));
  for(const c of e.choices) for(const key of ['affinity','reward','statUp','weaponPower','luck']) assert.equal(c.result[key],undefined);
 }
});
for(const npc of ids)test(`${npc}: confession links to real first scene; second offered at page 10 and memories persist`,()=>{
 const final=ENCOUNTERS.find(e=>e.id===(npc==='rael'?'rael_final':`${npc}_final_choice`));
 const choice=final.choices.findIndex(c=>c.result.setFlags?.includes(`romance_${npc}_promise`));
 const event=final.choices[choice];const first=ROMANCE_ENCOUNTERS.find(e=>e.id===event.result.nextId);assert.ok(first);
 const second=ROMANCE_ENCOUNTERS.find(e=>e.npcId===npc&&e.id!==first.id);
 run().startRun(`romance-${npc}`);useRun.setState({status:'rel',act:3,floor:7,activeEncounter:final.id,flags:[EXPANDED_STORY,...event.require.flagsAll]});
 run().resolveEncounterChoice(choice);assert.equal(run().encounterOutcome.nextId,first.id);run().continueEncounter();assert.equal(run().activeEncounter,first.id);
 const before={hp:run().hp,mp:run().mp,stats:run().stats,aff:run().affinity};run().resolveEncounterChoice(0);assert.deepEqual({hp:run().hp,mp:run().mp,stats:run().stats,aff:run().affinity},before);
 const snap=JSON.parse(JSON.stringify(persistenceOptions['endless-archive-run'].partialize(run())));useRun.setState(snap);run().resolveEncounterChoice(0);assert.equal(run().seenEncounters.filter(x=>x===first.id).length,1);
 const flags=run().flags;const offer=reunionOffer(3,10,flags,run().seenEncounters,'unnamed_station',zero);assert.equal(offer.node.encounterId,second.id);
 const withEcho=resolveRunEndings(flags,true).bonuses[0]; const withoutEcho=resolveRunEndings(flags.filter(f=>!f.startsWith('romance_memory_')),true).bonuses[0];assert.ok(withEcho.text.startsWith(withoutEcho.text));assert.ok(withEcho.text.length>withoutEcho.text.length);
 useRun.setState({status:'rel',activeEncounter:second.id,encounterOutcome:null});run().resolveEncounterChoice(1);assert.ok(!run().flags.includes(second.choices[0].result.setFlags[0]));assert.ok(run().flags.includes(`romance_${npc}_promise`));
});
test('daily relationship variants need the explicit promise, not merely high affinity',()=>{
 for(const [npc,id] of [['rael','companion_rael_tea_taste'],['seon','companion_seon_bread'],['kairu','companion_kairu_taste']]){
 const e=ENCOUNTERS.find(x=>x.id===id),aff={...zero,[npc]:100};const flags=[`route_${npc}_happy`];
 assert.equal(encounterDialogue(e,aff,flags),e.dialogue.high);
 assert.ok(encounterDialogue(e,aff,[...flags,`romance_${npc}_promise`]).startsWith(e.dialogue.high+'\n\n'));
 }
});
