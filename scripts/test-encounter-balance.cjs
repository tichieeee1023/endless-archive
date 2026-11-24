require('./test-notebook.cjs');
const {test,assert,run,useRun,localRequire,persistenceOptions}=require('./test-p1.cjs');
const {ENCOUNTERS}=localRequire('./src/data/encounters.js');
const {EXPANDED_STORY}=localRequire('./src/data/mainStory.js');
const {COMMON_CHAINS}=localRequire('./src/data/independentEncounters.js');
const {SIDE_STORIES}=localRequire('./src/data/sideStories.js');
const {eligibleEncounters,encounterWeight,explorationPool,explorationWeights,pickWeightedEncounter}=localRequire('./src/lib/encounterPool.js');
const {sideStoryOffer}=localRequire('./src/lib/sideStoryOffer.js');
const {reunionOffer}=localRequire('./src/lib/companions.js');
const {generateChoices}=localRequire('./src/lib/mapgen.js');
const {buildNotebook}=localRequire('./src/lib/notebook.js');
const zero={rael:0,seon:0,kairu:0};
const get=id=>ENCOUNTERS.find(e=>e.id===id);
const start=()=>{run().startRun('balance04');run().skipPrologue();run().choosePrologue(0);run().selectStory('unnamed_station');run().chooseStoryOpening(0);};
const toPage=(act,floor)=>{useRun.setState({act,floor:floor-1,status:'resolving',nodeResult:null});run().advanceFloor();};
test('first meetings remain random, all eligible events have positive weight and early long stories are favored',()=>{
 const p=eligibleEncounters(ENCOUNTERS,1,[],[],'unnamed_station',zero);const w=explorationWeights(p,1,[]);
 assert.ok(w.every(x=>x>0));assert.equal(w[p.indexOf(get('side_child_1'))],encounterWeight(get('side_child_1'))*2.5);
 assert.equal(sideStoryOffer(1,3,[],[]),undefined);assert.equal(reunionOffer(1,3,[],[],'unnamed_station',zero),undefined);
 assert.ok(p.some(e=>e.npcId)&&p.some(e=>!e.npcId));assert.ok(p.every(e=>!e.requiresAll?.length));
});
test('NPC share is bounded only when both categories are eligible, never blocks a legal event',()=>{
 const p=[get('rael_encounter_2'),get('train_letter')];let w=explorationWeights(p,2,[]);assert.ok(Math.abs(w[0]/(w[0]+w[1])-.5)<1e-9);
 const low=[get('companion_rael_tea_taste'),get('train_letter_echo')];w=explorationWeights(low,2,[]);assert.ok(Math.abs(w[0]/(w[0]+w[1])-.22)<1e-9);
 assert.deepEqual(explorationWeights([p[0]],2,[]),[encounterWeight(p[0])]);assert.deepEqual(explorationWeights([],2,[]),[]);
});
test('recent repeated daily NPC conversations get a mild penalty, not core or special scenes',()=>{
 const p=[get('companion_rael_tea_taste'),get('rael_encounter_2'),get('companion_rael_unplanned_walk')];const before=explorationWeights(p,2,[]);const after=explorationWeights(p,2,['companion_rael_day_off','companion_rael_empty_platform']);assert.equal(after[0],before[0]*.6);assert.deepEqual(after.slice(1),before.slice(1));
});
test('random exploration excludes visible reunion events even when no other event remains',()=>{
 const p=[get('train_letter'),get('train_empty_seat')];assert.deepEqual(explorationPool(p,['train_letter']),[p[1]]);
 assert.equal(pickWeightedEncounter(p,1,[],[],()=>0,undefined,zero,['train_letter']),'train_empty_seat');
 assert.equal(pickWeightedEncounter(p,1,[],[],()=>0,undefined,zero,p.map(e=>e.id)),null);
 assert.equal(pickWeightedEncounter(p,1,[],['train_letter'],()=>0,undefined,zero,['train_empty_seat']),null);
});
for(const [first,last] of COMMON_CHAINS)test(`common continuation ${last}: gated, optional and once-only`,()=>{
 const e=get(last), flags=[...e.requiresAll];const act=e.minAct;
 assert.equal(sideStoryOffer(act,3,[],[first]),undefined);assert.equal(sideStoryOffer(act-1,3,flags,[first]),undefined);
 assert.equal(sideStoryOffer(act,3,flags,[first]).node.encounterId,last);assert.equal(sideStoryOffer(act,3,flags,[first,last]),undefined);
});
test('long-story finale takes precedence at equal offer count, then rotates; new act resets opportunity count',()=>{
 const f=['side_child_open2','side_postman_open1','letter_remembered','side_offer_2_3_child','side_offer_2_6_child'];const seen=['side_child_1','side_child_2','side_postman_1','train_letter'];
 const a=sideStoryOffer(3,3,f,seen);assert.equal(a.node.encounterId,'side_child_3');const b=sideStoryOffer(3,6,[...f,a.flag],seen);assert.notEqual(a.node.encounterId,b.node.encounterId);
});
test('new opportunities do not alter old 8-page saves or replace rest, boss and fixed story pages',()=>{
 const f=['side_child_open1','story_rael_met'];assert.equal(sideStoryOffer(2,8,f,[]),undefined);assert.equal(reunionOffer(3,8,f,[],'unnamed_station',zero),undefined);
 start();useRun.setState({flags:[...run().flags,...f],seenEncounters:['side_child_1','rael_encounter_1']});toPage(3,8);const s=run();assert.ok(s.choices.some(n=>n.type==='rest'));assert.ok(s.choices.some(n=>n.id.endsWith('reunion')));assert.ok(s.choices.some(n=>n.id.endsWith('side')));assert.deepEqual(s.choices.filter(n=>!n.encounterId),generateChoices(s.seed,3,8,12));
 toPage(3,9);assert.equal(run().choices.length,1);assert.ok(run().choices[0].id.endsWith('main'));toPage(3,12);assert.deepEqual(run().choices.map(n=>n.type),['boss']);
});
test('actual store generic choice cannot secretly select displayed continuation, explicit choice still works after reload',()=>{
 start();useRun.setState({flags:[...run().flags,'story_rael_met','letter_remembered'],seenEncounters:['rael_encounter_1','train_letter']});toPage(2,3);
 const s=run();const ids=s.choices.flatMap(n=>n.encounterId?[n.encounterId]:[]);const generic=s.choices.find(n=>n.type==='event'&&!n.encounterId);const explicit=s.choices.find(n=>n.id.endsWith('side'));assert.ok(generic&&explicit);assert.equal(explicit.encounterId,'train_letter_echo');
 const saved=JSON.parse(JSON.stringify(persistenceOptions['endless-archive-run'].partialize(s)));for(const r of [0,.12,.25,.5,.75,.9999]){useRun.setState(saved);const old=Math.random;Math.random=()=>r;try{run().selectNode(generic);assert.ok(!ids.includes(run().activeEncounter));}finally{Math.random=old;}}
 useRun.setState(saved);assert.equal(buildNotebook({...run(),logs:run().logs}).passengers.find(g=>g.id==='train_letter').status,'이번 페이지에서 재회 가능');run().selectNode(explicit);assert.equal(run().activeEncounter,'train_letter_echo');run().resolveEncounterChoice(0);run().continueEncounter();assert.ok(run().seenEncounters.includes('train_letter_echo'));
});
test('all 129 authored IDs remain intact, no changes to once-only rules or fixed scene weights',()=>{
 assert.equal(ENCOUNTERS.length,129);assert.equal(new Set(ENCOUNTERS.map(e=>e.id)).size,129);assert.ok(ENCOUNTERS.every(e=>e.once!==false));assert.ok(ENCOUNTERS.filter(e=>e.storyId==='unnamed_station').every(e=>e.weight===0));assert.equal(SIDE_STORIES.length,12);
});
