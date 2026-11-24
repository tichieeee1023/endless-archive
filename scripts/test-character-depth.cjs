const {test,assert,ENCOUNTERS,localRequire,run,useRun}=require('./test-p1.cjs');
const {PERSONALITY_ENCOUNTERS}=localRequire('./src/data/personalityEncounters.js');
const {eligibleEncounters}=localRequire('./src/lib/encounterPool.js');
const {encounterDialogue}=localRequire('./src/lib/companions.js');
const {buildNotebook}=localRequire('./src/lib/notebook.js');
const {NPCS}=localRequire('./src/data/npcs.js');
const {resolveRunEndings}=localRequire('./src/lib/ending.js');
const zero={rael:0,seon:0,kairu:0};
const allMet=['story_rael_met','story_seon_met','story_kairu_met','story_kairu_clue'];
const shared=PERSONALITY_ENCOUNTERS.find(e=>!e.npcId);
const eligible=(act,flags,seen=[])=>eligibleEncounters(ENCOUNTERS,act,flags,seen,'unnamed_station',zero);
test('seven distinct optional scenes, two per character plus one group; no new route prerequisites',()=>{
 assert.equal(PERSONALITY_ENCOUNTERS.length,7);
 assert.equal(new Set(ENCOUNTERS.map(e=>e.id)).size,129);
 for(const id of Object.keys(NPCS))assert.equal(PERSONALITY_ENCOUNTERS.filter(e=>e.npcId===id).length,2);
 for(const e of PERSONALITY_ENCOUNTERS){assert.equal(e.choices.length,2);assert.equal(e.weight,2);assert.ok(e.requiresAll.length);assert.ok(e.choices.every(c=>c.result.text&&!c.result.setFlags&&!c.result.nextId&&!c.result.reward&&!c.result.statUp&&!c.result.battle));assert.ok(!eligible(3,[]).includes(e));assert.ok(eligible(3,allMet).includes(e));assert.ok(!eligible(3,allMet,[e.id]).includes(e));}
});
test('group scene needs all three known and Kairu outside the book; no bad-route or romance assumptions',()=>{
 for(const f of allMet)assert.ok(!eligible(3,allMet.filter(x=>x!==f)).includes(shared));
 for(const f of ['route_rael_bad','route_seon_bad','route_kairu_bad','kairu_returned'])assert.ok(!eligible(3,[...allMet,f]).includes(shared));
 assert.ok(!eligible(1,allMet).includes(shared));assert.ok(eligible(2,allMet).includes(shared));
 assert.match(shared.text,/라엘/);assert.match(shared.text,/세온/);assert.match(shared.text,/카이루/);
});
test('explicit romance variants never substitute for high-affinity friendship',()=>{
 for(const e of PERSONALITY_ENCOUNTERS.filter(e=>e.dialogue?.romance)){
  const high={...zero,[e.npcId]:80};
  assert.equal(encounterDialogue(e,high,[]),e.dialogue.high);
  assert.equal(encounterDialogue(e,high,[`romance_${e.npcId}_promise`,`route_${e.npcId}_happy`]),e.dialogue.romance);
 }
});
test('new optional scenes resolve with existing store and notebook; only relationship points can change',()=>{
 for(const e of PERSONALITY_ENCOUNTERS){
  run().startRun('character-depth');useRun.setState({status:'rel',activeEncounter:e.id,flags:[...allMet],affinity:{...zero}});
  const before=run();run().resolveEncounterChoice(0);const after=run();
  assert.ok(after.seenEncounters.includes(e.id));assert.equal(after.encounterOutcome.text,e.choices[0].result.text);assert.deepEqual(after.flags,before.flags);assert.equal(after.hp,before.hp);assert.equal(after.gold,before.gold);assert.equal(after.mp,before.mp);
  if(e.npcId)assert.equal(after.affinity[e.npcId],2);else assert.deepEqual(after.affinity,zero);
  const notebook=buildNotebook(after);assert.ok(notebook.people.some(g=>g.entries.some(x=>x.id===e.id)));assert.ok(!notebook.passengers.some(g=>g.entries.some(x=>x.id===e.id)));
  assert.equal(resolveRunEndings(after.flags,true).bonuses.length,0);
 }
});
test('Seon stays composed at the signal and affectionate only in explicit romantic scenes',()=>{
 const get=id=>ENCOUNTERS.find(e=>e.id===id);
 assert.match(NPCS.seon.summary,/노련하고 담담/);assert.match(get('seon_signal').text,/위치부터 기억/);assert.doesNotMatch(get('seon_signal').text,/벌떡/);
 assert.match(get('romance_scene_seon_hand_in_hand').text,/손 잡을래/);assert.ok(get('romance_scene_seon_hand_in_hand').requiresAll.includes('romance_seon_promise'));
 assert.match(get('romance_scene_seon_quiet_morning').text,/보고 싶은 얼굴/);
});

test('quiet visits are visible only on expanded page 4 and preserve all seeded choices',()=>{
 const {personalityOffer}=localRequire('./src/lib/companions.js');const {EXPANDED_STORY}=localRequire('./src/data/mainStory.js');const {generateChoices}=localRequire('./src/lib/mapgen.js');
 const f=[EXPANDED_STORY,...allMet];assert.equal(personalityOffer(2,4,f,[],zero).encounterId,shared.id);
 assert.equal(personalityOffer(2,5,f,[],zero),undefined);assert.equal(personalityOffer(2,4,allMet,[],zero),undefined);assert.equal(personalityOffer(2,4,[EXPANDED_STORY],[],zero),undefined);
 assert.notEqual(personalityOffer(2,4,f,[shared.id],zero).encounterId,shared.id);
 run().startRun('quiet-visit');run().skipPrologue();run().choosePrologue(0);run().selectStory('unnamed_station');run().chooseStoryOpening(0);
 useRun.setState({act:2,floor:3,status:'resolving',nodeResult:null,flags:f,seenEncounters:[]});run().advanceFloor();
 const s=run();const offer=s.choices.find(n=>n.id.endsWith('personality'));assert.equal(offer.encounterId,shared.id);assert.deepEqual(s.choices.filter(n=>!n.encounterId),generateChoices(s.seed,2,4,12));assert.ok(s.choices.some(n=>n.type==='shop'));run().selectNode(offer);assert.equal(run().activeEncounter,shared.id);
});
