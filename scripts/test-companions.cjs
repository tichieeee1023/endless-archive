require('./test-balance.cjs');
const {test,assert,run,useRun,localRequire,persistenceOptions}=require('./test-p1.cjs');
const {ENCOUNTERS}=localRequire('./src/data/encounters.js');
const {COMPANION_ENCOUNTERS,BOSS_COMPANION_ENCOUNTERS}=localRequire('./src/data/companionEncounters.js');
const {reunionOffer,encounterDialogue,companionFor}=localRequire('./src/lib/companions.js');
const {eligibleEncounters}=localRequire('./src/lib/encounterPool.js');
const {generateChoices}=localRequire('./src/lib/mapgen.js');
const {autoBattleAction}=localRequire('./src/lib/combat.js');
const {closestBond}=localRequire('./src/lib/defeat.js');
const zero={rael:0,seon:0,kairu:0};
const ids=['rael','seon','kairu'];
const find=id=>ENCOUNTERS.find(e=>e.id===id);
const fixed=(fn,v=.5)=>{const old=Math.random;Math.random=()=>v;try{return fn();}finally{Math.random=old;}};
const snapshot=()=>JSON.parse(JSON.stringify(persistenceOptions['endless-archive-run'].partialize(run())));
const eligible=(act,flags,seen=[],affinity=zero)=>eligibleEncounters(ENCOUNTERS,act,flags,seen,'unnamed_station',affinity);

test('24 optional companion encounters + 3 boss scenes, balanced character categories and valid authored choices',()=>{
  assert.equal(COMPANION_ENCOUNTERS.length,24);assert.equal(BOSS_COMPANION_ENCOUNTERS.length,3);
  for(const npc of ids){const scenes=COMPANION_ENCOUNTERS.filter(e=>e.npcId===npc);assert.equal(scenes.length,8);
    for(const [kind,count] of [['daily',4],['memory',2],['special',2]])assert.equal(scenes.filter(e=>e.companionKind===kind).length,count);
    for(const e of scenes){assert.ok(e.text&&e.dialogue.high&&e.choices.length===2);assert.ok(e.requiresAll.includes(`story_${npc}_met`));assert.ok(e.choices.every(c=>c.result.text));assert.ok(e.choices.every(c=>!c.result.setFlags?.some(f=>f.startsWith('romance_')||f.startsWith('route_'))));}
  }
  assert.ok(BOSS_COMPANION_ENCOUNTERS.every(e=>e.weight===0));
});
test('new special scenes require affinity and a meeting, while main story needs no affinity',()=>{
  const flags=['story_rael_met','bond_rael_1'];const id='companion_rael_unplanned_walk';
  assert.ok(eligible(2,flags,[],{...zero,rael:12}).some(e=>e.id===id));
  assert.ok(!eligible(2,flags,[],{...zero,rael:11}).some(e=>e.id===id));
  assert.ok(eligible(2,['story_rael_met']).some(e=>e.id==='rael_encounter_2'));
  assert.ok(!eligible(1,[],[],{...zero,rael:100}).some(e=>e.id.startsWith('companion_rael')));
});
test('Kairu cannot appear physically before his clue or after returning to the book',()=>{
  assert.ok(!eligible(2,['story_kairu_met']).some(e=>e.id==='companion_kairu_taste'));
  assert.ok(eligible(2,['story_kairu_met','story_kairu_clue']).some(e=>e.id==='companion_kairu_taste'));
  assert.ok(!eligible(3,['story_kairu_met','story_kairu_clue','kairu_returned']).some(e=>e.id==='companion_kairu_taste'));
});
test('reunion is optional, story-eligible and round-robins between NPCs without forcing first meetings',()=>{
  assert.equal(reunionOffer(1,3,[],[], 'unnamed_station',zero),undefined);
  const flags=['story_rael_met','story_seon_met','story_kairu_met'];
  const first=reunionOffer(2,3,flags,[], 'unnamed_station',zero);assert.equal(first.node.encounterId,'rael_encounter_2');
  const second=reunionOffer(2,6,[...flags,first.flag],[], 'unnamed_station',zero);assert.equal(second.node.encounterId,'seon_2');
  const third=reunionOffer(2,7,[...flags,first.flag,second.flag],[], 'unnamed_station',zero);assert.equal(third.node.encounterId,'kairu_2');
  assert.equal(reunionOffer(2,8,flags,[], 'unnamed_station',zero),undefined);
  const clue=reunionOffer(3,3,['story_rael_met','story_rael_clue'],['rael_encounter_1','rael_encounter_2'],'unnamed_station',zero);
  assert.equal(clue.node.encounterId,'rael_registry');
});
test('store appends the reunion choice to existing seed map, skip preserves eligibility, selection works after save',()=>{
  run().startRun('reunion');useRun.setState({status:'resolving',act:1,floor:2,flags:['story_rael_met'],seenEncounters:['rael_encounter_1']});run().advanceFloor();
  const s=run(),offer=s.choices.find(n=>n.encounterId);assert.equal(offer.encounterId,'rael_encounter_2');
  assert.deepEqual(s.choices.filter(n=>!n.encounterId),generateChoices(s.seed,1,3,8));
  const saved=snapshot();useRun.setState(saved);run().selectNode(offer);assert.equal(run().activeEncounter,'rael_encounter_2');
  run().resolveEncounterChoice(1);run().resolveEncounterChoice(1);assert.equal(run().affinity.rael,6);
  run().continueEncounter();assert.equal(run().floor,4);
  run().startRun('skip');useRun.setState({status:'resolving',act:1,floor:2,flags:['story_rael_met'],seenEncounters:['rael_encounter_1']});run().advanceFloor();
  useRun.setState({status:'resolving',floor:5});run().advanceFloor();assert.equal(run().choices.find(n=>n.encounterId).encounterId,'rael_encounter_2');
});
test('high affection dialogue is non-romantic unless explicit promise exists; original event choice conditions unchanged',()=>{
  const e=find('rael_encounter_2');assert.equal(encounterDialogue(e,zero,[]),e.text);assert.notEqual(encounterDialogue(e,{...zero,rael:18},[]),e.text);
  const b=find('boss_companion_rael');assert.equal(encounterDialogue(b,{...zero,rael:100},[]),b.dialogue.high);assert.equal(encounterDialogue(b,{...zero,rael:100},['romance_rael_promise']),b.dialogue.romance);
  assert.equal(encounterDialogue(find('train_letter'),zero,[]),find('train_letter').text);
});
function boss(npc,aff=18,act=3){run().startRun('boss-companion');const node=generateChoices('boss-companion',act,8,8)[0];useRun.setState({status:'choosing',act,floor:8,hp:10,mp:5,choices:[node],affinity:{...zero,[npc]:aff},flags:[`story_${npc}_met`]});run().selectNode(node);return node;}
for(const npc of ids)test(`${npc}: boss dialogue persists and aid applies exactly once, final floor stays 8`,()=>{
  const node=boss(npc);assert.equal(run().status,'rel');assert.equal(run().activeEncounter,`boss_companion_${npc}`);assert.equal(run().battle,null);
  run().selectNode(node);assert.equal(run().status,'rel');
  run().resolveEncounterChoice(0);const saved=snapshot();assert.ok(saved.flags.includes(`boss_support_${npc}`));assert.equal(saved.status,'rel');assert.equal(saved.current.type,'boss');
  useRun.setState(saved);run().continueEncounter();assert.equal(run().status,'battle');assert.equal(run().floor,8);assert.equal(run().act,3);assert.equal(run().battle.enemy.maxHp,345);
  assert.equal(run().hp,npc==='rael'?22:10);assert.equal(run().mp,npc==='kairu'?17:5);assert.equal(run().battle.companionGuard,npc==='seon');
  const after=snapshot();run().continueEncounter();assert.deepEqual(snapshot(),after);assert.equal(run().activeEncounter,null);
});
test('declining aid and low affection preserve normal final boss battle; early bosses never trigger support',()=>{
  boss('rael');run().resolveEncounterChoice(1);run().continueEncounter();assert.equal(run().hp,10);assert.ok(!run().flags.includes('boss_support_rael'));
  boss('rael',7);assert.equal(run().status,'battle');boss('rael',30,2);assert.equal(run().status,'battle');
});
test('Seon guard persists, is not wasted on evasion/brace, blocks only one real hit, and auto saves potion',()=>{
  boss('seon');run().resolveEncounterChoice(0);run().continueEncounter();useRun.setState({hp:60,stats:{...run().stats,insight:14}});
  let s=run();assert.notEqual(autoBattleAction(s.battle,{...s,hp:1,healthPotions:1}),'potion');
  fixed(()=>run().playerAttack(),0);assert.equal(run().battle.companionGuard,true);assert.equal(run().hp,60);
  fixed(()=>run().playerAttack(),.5);assert.equal(run().battle.companionGuard,false);assert.equal(run().hp,60);assert.ok(run().battle.log.some(t=>t.includes('세온의 지원으로')));
  fixed(()=>run().playerAttack(),.5);assert.ok(run().hp<60);
  boss('seon');run().resolveEncounterChoice(0);run().continueEncounter();useRun.setState({battle:{...run().battle,turn:3}});run().playerBrace();assert.equal(run().battle.companionGuard,true);
  const saved=snapshot();assert.equal(saved.battle.companionGuard,true);
});
test('unavailable BAD characters cannot be forced into new scenes, reunion, or rescue',()=>{
  const flags=['story_kairu_met','story_kairu_clue','route_kairu_bad'];const affinity={...zero,kairu:100,seon:18};
  assert.equal(companionFor(affinity,flags),'seon');assert.equal(closestBond(affinity,flags).npc,'seon');
  assert.ok(!eligible(3,flags,[],affinity).some(e=>e.npcId==='kairu'));
  assert.equal(reunionOffer(3,6,flags,[], 'unnamed_station',affinity),undefined);
});
test('new run clears support and reunion flags, legacy v13 saves need no destructive migration',()=>{
  boss('rael');run().resolveEncounterChoice(0);run().continueEncounter();run().startRun('fresh');assert.deepEqual(run().flags,[]);assert.deepEqual(run().seenEncounters,[]);assert.equal(run().battle,null);
  assert.equal(persistenceOptions['endless-archive-run'].version,14);
});
