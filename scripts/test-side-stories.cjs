require('./test-main-story.cjs');
const {test,assert,run,useRun,localRequire,resolveRunEndings,ENCOUNTERS,persistenceOptions}=require('./test-p1.cjs');
const {SIDE_STORIES,SIDE_STORY_ENCOUNTERS,sideStoryEchoes}=localRequire('./src/data/sideStories.js');
const {sideStoryOffer}=localRequire('./src/lib/sideStoryOffer.js');
const {eligibleEncounters}=localRequire('./src/lib/encounterPool.js');
const {getEncounterArt}=localRequire('./src/data/artLibrary.js');
const flagsFor=c=>c.result.setFlags;
const get=id=>SIDE_STORY_ENCOUNTERS.find(e=>e.id===id);
const start=()=>{run().startRun('passengers');run().skipPrologue();run().choosePrologue(0);run().selectStory('unnamed_station');run().chooseStoryOpening(0);};
const toPage=(act,floor)=>{useRun.setState({act,floor:floor-1,status:'resolving',nodeResult:null});run().advanceFloor();};
const choicesFor=(act,flags=[],seen=[])=>eligibleEncounters(SIDE_STORY_ENCOUNTERS,act,flags,seen);
test('20 distinct passenger events, 4 three-part stories and 8 shorts, no NPC or romance conditions, mapped art',()=>{
 assert.equal(SIDE_STORY_ENCOUNTERS.length,20);assert.equal(SIDE_STORIES.filter(s=>s.stages.length===3).length,4);assert.equal(SIDE_STORIES.filter(s=>s.stages.length===1).length,8);
 assert.equal(new Set(ENCOUNTERS.map(e=>e.id)).size,ENCOUNTERS.length);assert.equal(ENCOUNTERS.length,122);
 for(const e of SIDE_STORY_ENCOUNTERS){assert.ok(!e.npcId&&!e.storyId&&!e.minAffinity);assert.ok(getEncounterArt(e.id));assert.equal(e.choices.length,2);for(const c of e.choices){assert.ok(c.result.text);assert.equal(c.result.setFlags.length,1);assert.ok(c.result.setFlags[0].startsWith('side_'));assert.equal(sideStoryEchoes(new Set(c.result.setFlags)).length,1);}}
});
for(const story of SIDE_STORIES.filter(s=>s.stages.length===3))test(`${story.id}: first meeting random, later stages gated by choices and act, optional offer, one line only`,()=>{
 const [first,second,third]=story.stages.map(get);const f1=flagsFor(first.choices[0]);const f2=flagsFor(second.choices[0]);const final=flagsFor(third.choices[0]);
 assert.ok(choicesFor(1).includes(first));assert.ok(!sideStoryOffer(1,3,[],[]));assert.ok(!choicesFor(1,f1,[first.id]).includes(second));assert.ok(!choicesFor(2,[],[]).includes(second));assert.ok(!choicesFor(2,flagsFor(first.choices[1]),[first.id]).includes(second));assert.ok(choicesFor(2,f1,[first.id]).includes(second));
 assert.equal(sideStoryOffer(2,3,f1,[first.id]).node.encounterId,second.id);assert.ok(!sideStoryOffer(2,5,f1,[first.id]));assert.ok(!choicesFor(2,[...f1,...f2],[first.id,second.id]).includes(third));assert.equal(sideStoryOffer(3,7,[...f1,...f2],[first.id,second.id]).node.encounterId,third.id);
 const partial=sideStoryEchoes(new Set(f1));const completed=sideStoryEchoes(new Set([...f1,...f2,...final]));assert.equal(partial.length,1);assert.equal(completed.length,1);assert.notEqual(partial[0],completed[0]);assert.notEqual(completed[0],sideStoryEchoes(new Set([...f1,...f2,...flagsFor(third.choices[1])]))[0]);
 assert.ok(!sideStoryOffer(3,10,[...f1,...f2,...final],story.stages));
});
test('all story echoes survive every journey result without changing ID, NPC outcomes or romance',()=>{
 const flags=SIDE_STORIES.flatMap(s=>flagsFor(get(s.stages.at(-1)).choices[0]));const lines=sideStoryEchoes(new Set(flags));assert.equal(lines.length,12);
 for(const [extra,win] of [[['ending_stay'],true],[['ending_depart'],true],[['ending_return'],true],[[],true],[[],false],[['final_defeat_rael'],false]]){
  const base=[...extra,'route_seon_happy','romance_seon_promise'];const old=resolveRunEndings(base,win);const now=resolveRunEndings([...base,...flags],win);assert.equal(now.journey.id,old.journey.id);assert.deepEqual(now.routes,old.routes);assert.deepEqual(now.bonuses,old.bonuses);assert.equal(now.journey.text,old.journey.text+'\n\n'+lines.join('\n\n'));
 }
});
test('actual store: continuation offer coexists with normal nodes, is saved, resolves once, main page unchanged',()=>{
 start();useRun.setState({flags:[...run().flags,'side_child_open1'],seenEncounters:['side_child_1']});toPage(2,3);const offered=run().choices.find(n=>n.id.endsWith('side'));assert.equal(offered.encounterId,'side_child_2');assert.ok(run().choices.some(n=>!n.encounterId));
 const persisted=JSON.parse(JSON.stringify(persistenceOptions['endless-archive-run'].partialize(run())));useRun.setState(persisted);run().selectNode(offered);assert.equal(run().activeEncounter,'side_child_2');run().resolveEncounterChoice(0);run().resolveEncounterChoice(1);assert.ok(run().flags.includes('side_child_open2'));assert.ok(!run().flags.includes('side_child_left2'));run().continueEncounter();assert.equal(run().floor,4);toPage(2,5);assert.equal(run().choices.length,1);assert.ok(run().choices[0].id.endsWith('main'));
});
test('optional offers rotate between active passenger stories, no side flags leak to a new run',()=>{
 const flags=['side_child_open1','side_postman_open1'];const seen=['side_child_1','side_postman_1'];const a=sideStoryOffer(2,3,flags,seen);const b=sideStoryOffer(2,6,[...flags,a.flag],seen);assert.notEqual(a.node.encounterId,b.node.encounterId);start();assert.equal(sideStoryEchoes(new Set(run().flags)).length,0);
});
