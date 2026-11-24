require('./test-quality.cjs');
const {test,assert,run,useRun,localRequire,persistenceOptions}=require('./test-p1.cjs');
const {useMeta}=localRequire('./src/store/useMeta.js');
const {slotRef}=localRequire('./src/store/useSaveSlots.js');
const {getEndingArt}=localRequire('./src/data/artLibrary.js');
const {EXPANDED_STORY}=localRequire('./src/data/mainStory.js');
const {journeyEndings}=localRequire('./src/lib/journeyHistory.js');
const meta=()=>useMeta.getState();
const config=persistenceOptions['endless-archive-run'];
const metaConfig=persistenceOptions['endless-archive-meta'];
const clone=x=>JSON.parse(JSON.stringify(x));
function reset(){useMeta.setState({runCount:0,victories:0,deaths:0,defeats:0,endingLog:{},legacyEndingLog:{},journeyHistory:[],endings:[],collectedPages:[]});slotRef.current=1;}
function finish(flags=[],outcome='victory',seed='same-seed'){
  run().startRun(seed);
  useRun.setState({storyId:'unnamed_station',act:3,floor:12,status:'ended',flags:[EXPANDED_STORY,...flags],nodeResult:{logs:[],endsRun:outcome}});
  run().recordCompletedJourney();
  return meta().journeyHistory[0];
}
test('same ending and same seed keep distinct immutable journey snapshots and passenger echoes',()=>{
  reset();const first=finish(['ending_archive','side_rain_shared','route_rael_happy','romance_rael_promise']);const saved=clone(first);
  const second=finish(['ending_archive','side_rain_saved','route_seon_normal']);
  assert.notEqual(first.id,second.id);assert.equal(first.seed,second.seed);assert.equal(first.journey.id,second.journey.id);
  assert.notEqual(first.journey.text,second.journey.text);assert.match(first.journey.text,/작은 화분/);
  assert.deepEqual(meta().journeyHistory[1],saved);assert.equal(meta().endingLog.solo.text,second.journey.text);
  assert.deepEqual(journeyEndings(first).map(e=>e.id),['solo','rael_route_happy','rael_romance']);
  assert.equal(meta().runCount,2);assert.equal(meta().victories,2);assert.equal(meta().endings.filter(e=>e==='solo').length,1);
});
test('separate slots write to one shared archive without treating a repeated seed as the same run',()=>{
  reset();const a=finish(['ending_return']);slotRef.current=2;const b=finish(['ending_return']);assert.equal(a.slot,1);assert.equal(b.slot,2);assert.notEqual(a.id,b.id);assert.equal(meta().journeyHistory.length,2);slotRef.current=1;
});
test('double invocation and interrupted save retry are idempotent',()=>{
  reset();const record=finish(['ending_archive']);const before=clone(meta().journeyHistory);
  run().recordCompletedJourney();assert.equal(meta().runCount,1);
  const persisted=clone(config.partialize(run()));assert.equal(persisted.journeyId,record.id);
  useRun.setState({...persisted,endingRecorded:false,endingResult:null});run().recordCompletedJourney();
  assert.deepEqual(meta().journeyHistory,before);assert.equal(meta().runCount,1);assert.equal(run().endingRecorded,true);
});
test('victory, defeat and death each retain their exact endings and tally independently',()=>{
  reset();finish(['ending_depart']);const defeat=finish(['final_defeat_rael','side_child_named'],'defeat');const death=finish(['side_child_wait'],'death');
  assert.equal(defeat.journey.id,'rael_defeat');assert.equal(death.journey.id,'death');assert.match(defeat.journey.text,/별이라는 이름/);assert.match(death.journey.text,/서두르지/);
  assert.deepEqual([meta().runCount,meta().victories,meta().defeats,meta().deaths],[3,1,1,1]);
  for(const r of meta().journeyHistory){const art=getEndingArt(r.journey.id);assert.ok(meta().collectedPages.includes(`art:${art.id}`));}
});
test('legacy latest texts survive new acquisitions and subsequent hydration, without fake old journeys',()=>{
  reset();const old={runCount:7,victories:5,deaths:2,endingLog:{solo:{title:'서고의 주인',text:'이전 후일담',timestamp:42}},endings:['solo'],collectedPages:['old-art']};
  useMeta.setState(metaConfig.merge(clone(old),meta()));assert.equal(meta().journeyHistory.length,0);assert.equal(meta().legacyEndingLog.solo.text,'이전 후일담');
  const r=finish(['ending_archive']);assert.equal(r.number,8);assert.equal(meta().legacyEndingLog.solo.text,'이전 후일담');assert.ok(meta().collectedPages.includes('old-art'));
  const rehydrated=metaConfig.merge(clone(meta()),meta());assert.equal(rehydrated.journeyHistory.length,1);assert.equal(rehydrated.legacyEndingLog.solo.text,'이전 후일담');assert.equal(rehydrated.runCount,8);
});
test('v13 saves migrate without changing existing flags, records or page state; legacy ended runs are not recounted',()=>{
  reset();run().startRun('old');const old=clone(config.partialize(run()));delete old.journeyId;
  old.flags=['side_child_open1'];old.floor=6;old.act=2;const migrated=config.migrate(clone(old),13);assert.deepEqual(migrated,{...old,journeyId:null});
  useRun.setState({...migrated,status:'ended',endingRecorded:true,nodeResult:{logs:[],endsRun:'death'}});run().recordCompletedJourney();assert.equal(meta().runCount,0);
  useRun.setState({endingRecorded:false});run().recordCompletedJourney();assert.equal(meta().runCount,1);assert.ok(run().journeyId);assert.equal(meta().journeyHistory[0].act,2);
});
test('unfinished journey cannot write an ending record',()=>{reset();run().startRun('incomplete');run().recordCompletedJourney();assert.equal(meta().journeyHistory.length,0);assert.equal(meta().runCount,0);});
test('new acquisition snapshots are independent of draft object mutation',()=>{
  reset();const draft={id:'draft',slot:1,seed:'s',storyId:'unnamed_station',act:3,floor:12,outcome:'victory',journey:{id:'solo',npcId:null,title:'제목',text:'original'},routes:[{id:'rael_route_happy',npcId:'rael',grade:'happy',title:'r',text:'route'}],bonuses:[]};
  meta().recordJourney(draft);draft.journey.text='changed';draft.routes[0].text='changed';draft.routes.push({id:'fake'});assert.equal(meta().journeyHistory[0].journey.text,'original');assert.equal(meta().journeyHistory[0].routes[0].text,'route');assert.equal(meta().journeyHistory[0].routes.length,1);
});
