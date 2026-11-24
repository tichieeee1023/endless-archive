const { test, assert, ENCOUNTERS, localRequire } = require('./test-p1.cjs');
const { createHash } = require('node:crypto');
const original = ENCOUNTERS.filter(e=>!e.id.includes("_personality_") && e.id!=="personality_shared_table");
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
// Baselines captured from character-colors.zip before dialogue revisions.
test('personality revision preserves all encounter conditions, rewards, IDs and choice labels', () => {
 const mechanics = JSON.parse(JSON.stringify(original, (k,v) => ['text','dialogue'].includes(k) ? undefined : v));
 assert.equal(hash(mechanics),'1fe84b5c379ca0af11a614cc154c6ea76ce474daca2dbfd170b4f9820c9bd126');
 assert.equal(hash(original.map(e=>[e.id,e.title,e.choices.map(c=>c.text)])), 'b3dee725af9c5cfcb805f07b6e2c0d9e190ad81618c0a4db4ca7c69408488080');
});
test('main and passenger narratives are byte-equivalent in encounter data', () => {
 assert.equal(hash(original.filter(e=>!e.npcId)), 'c0fe6e920ad2524633597673e02b745bbc464596ba399ae12704796464bf6cdb');
});
test('distinct first meetings and trust responses retain the same romance gating', () => {
 const {encounterDialogue}=localRequire('./src/lib/companions.js');
 const cases=[['rael','rael_encounter_1','안내문','companion_rael_day_off','비효율적'],['seon','seon_1','조심해','companion_seon_cooking','솔직히 말해'],['kairu','kairu_1','주인공','companion_kairu_blank_day','독자가 불평']];
 for(const [npc,id,initial,daily,trust] of cases){
  const first=ENCOUNTERS.find(e=>e.id===id),e=ENCOUNTERS.find(e=>e.id===daily),low={rael:0,seon:0,kairu:0},high={...low,[npc]:20};
  assert.ok(encounterDialogue(first,low,[]).includes(initial));
  assert.ok(encounterDialogue(e,high,[]).includes(trust));
  assert.notEqual(encounterDialogue(e,high,[]),encounterDialogue(e,low,[]));
  assert.equal(original.filter(x=>x.npcId===npc).length,18);
 }
});
