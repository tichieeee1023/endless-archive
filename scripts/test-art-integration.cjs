// Tests the integrated P4 project art without a browser, with the project's TypeScript dev dependency.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const input = fs.readFileSync(path.join(root, 'src/data/artLibrary.ts'), 'utf8');
const compiled = ts.transpileModule(input, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } });
const loaded = { exports: {} };
new Function('module', 'exports', 'require', compiled.outputText)(loaded, loaded.exports, require);
const { ALL_ART, EVENT_ART, ENDING_ART, SHOP_ART, artIsUnlocked, getEncounterArt, getEndingArt, getShopArt } = loaded.exports;
const count = (type) => ALL_ART.filter(e => e.type === type).length;

test('narrative paragraphs are indented without blank lines', () => {
  const source = fs.readFileSync(path.join(root, 'src/lib/formatNarrative.ts'), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} };
  new Function('module', 'exports', js)(module, module.exports);
  const { formatNarrative } = module.exports;
  assert.equal(formatNarrative('여백이 닫힌다. “너무 가까이 왔어.”'), '　여백이 닫힌다.\n　“너무 가까이 왔어.”');
  assert.equal(formatNarrative('“괜찮아.” 그가 웃는다.'), '　“괜찮아.”\n　그가 웃는다.');
  assert.equal(formatNarrative('문이 열린다.\n\n“어서 와요.”'), '　문이 열린다.\n　“어서 와요.”');
  assert.equal(formatNarrative('첫 문단.\n\n둘째 문단.'), '　첫 문단.\n　둘째 문단.');
});

test('art catalogue contains the expected 92 optimized assets', () => {
  assert.equal(ALL_ART.length, 92);
  assert.deepEqual([count('events'), count('characters'), count('items')], [56, 24, 12]);
  assert.equal(new Set(ALL_ART.map(e=>e.id)).size, 92);
  for (const art of ALL_ART) {
    assert.match(art.src, /^\/art\/(events|characters|items)\/[\w-]+\.webp$/);
    const p = path.join(root, 'public', art.src.replace(/^\//,''));
    assert.ok(fs.statSync(p).size > 1000, `image missing/empty: ${p}`);
  }
});

test('every P4 encounter has an image, including non-romantic story events', () => {
  assert.equal(Object.keys(EVENT_ART).length, 104);
  for (const id of Object.keys(EVENT_ART)) assert.ok(getEncounterArt(id), `missing art for ${id}`);
  assert.equal(getEncounterArt('rael_tea')?.id, 'planned_02_3_cooling_tea');
  assert.equal(getEncounterArt('kairu_promise')?.id, 'planned_05_2_unread_promise');
  assert.equal(getEncounterArt('train_empty_seat')?.id, 'planned_06_2_returned_coat');
});

test('character HAPPY and relationship ending CGs are separate', () => {
  assert.equal(Object.keys(ENDING_ART).length, 24);
  for (const npc of ['rael','seon','kairu']) {
    const happy = getEndingArt(`${npc}_route_happy`);
    const romance = getEndingArt(`${npc}_romance`);
    assert.ok(happy && romance);
    assert.notEqual(happy.id, romance.id);
    assert.equal(happy.unlock, `${npc}_route_happy`);
    assert.equal(romance.unlock, `${npc}_romance`);
    assert.equal(artIsUnlocked(romance, new Set()), false);
    assert.equal(artIsUnlocked(happy, new Set([`${npc}_route_happy`])), true);
    const finalEvent = npc === 'rael' ? 'rael_final' : `${npc}_final_choice`;
    assert.equal(getEncounterArt(finalEvent,[`route_${npc}_happy`],false)?.id === happy.id, false);
    assert.equal(getEncounterArt(finalEvent,[`route_${npc}_happy`],true)?.id, happy.id);
    assert.equal(getEncounterArt(finalEvent,[`route_${npc}_happy`,`romance_${npc}_promise`],true)?.id, romance.id);
  }
});

test('shop items map to actual icon image files', () => {
  for (const id of ['mana','potion','will_up','wisdom_up']) assert.ok(SHOP_ART[id]);
  for (const id of Object.keys(SHOP_ART)) assert.equal(getShopArt(id)?.type,'items');
});

test('ordinary art stays hidden until it is discovered', () => {
  const scene = getEncounterArt('rael_tea');
  const item = getShopArt('potion');
  assert.equal(artIsUnlocked(scene, new Set()), false);
  assert.equal(artIsUnlocked(item, new Set()), false);
  assert.equal(artIsUnlocked(scene, new Set(), new Set([scene.id])), true);
  assert.equal(artIsUnlocked(item, new Set(), new Set([item.id])), true);
});

test('P4 components include art features and respect ending unlocks', () => {
  const code = (file) => fs.readFileSync(path.join(root, 'src/components',file), 'utf8');
  assert.match(code('EventModal.tsx'), /<ArtFrame art=\{sceneArt\}/);
  assert.match(code('EndingScreen.tsx'), /<ArtFrame art=\{getEndingArt\(route\.id\)/);
  assert.match(code('EndingScreen.tsx'), /<ArtFrame art=\{getEndingArt\(bonus\.id\)/);
  assert.match(code('EndingRecallModal.tsx'), /<ArtFrame art=\{getEndingArt\(endingId\)/);
  assert.match(code('ArchiveModal.tsx'), /<ArtGallery endings=\{endings\}/);
  assert.match(code('ShopPanel.tsx'), /shop-item__icon/);
  assert.match(code('ArtGallery.tsx'), /artIsUnlocked\(art, collected, discovered\)/);
});

test('new and changed TSX/TS components parse', () => {
  for (const file of ['EventModal.tsx','EndingScreen.tsx','EndingRecallModal.tsx','ArchiveModal.tsx','ShopPanel.tsx','ArtGallery.tsx','ArtFrame.tsx']) {
    const f=path.join(root,'src/components',file);
    const result=ts.transpileModule(fs.readFileSync(f,'utf8'), {fileName:file,compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022},reportDiagnostics:true});
    const errors=(result.diagnostics||[]).filter(x=>x.category===ts.DiagnosticCategory.Error);
    assert.equal(errors.length,0, `${file}: ${errors.map(x=>x.messageText).join('; ')}`);
  }
});


test('12 new CGs map to actual companion events and exclusive rescue endings', () => {
  const scenes = fs.readFileSync(path.join(root, 'src/data/companionEncounters.ts'), 'utf8');
  const expected = {rael: ['unplanned_walk','destinationless_walk',['tea_taste','day_off','empty_platform']], seon: ['cooking','cooking',['bread','birthday','lullaby']], kairu: ['two_bookmarks','two_bookmarks',['blank_day','borrowed_voice','outside_view']]};
  const unique = new Set();
  for (const [npc,[event,suffix,dailies]] of Object.entries(expected)) {
    const daily = getEncounterArt(`companion_${npc}_${dailies[0]}`);
    const special = getEncounterArt(`companion_${npc}_${event}`);
    const boss = getEncounterArt(`boss_companion_${npc}`);
    const rescue = getEndingArt(`${npc}_defeat`);
    assert.equal(daily.id, `cg_${npc}_daily`);
    assert.equal(special.id, `cg_${npc}_${suffix}`);
    assert.equal(boss.id, `cg_${npc}_before_boss`);
    assert.equal(rescue.id, `cg_${npc}_rescue_ending`);
    for (const id of dailies) {assert.ok(scenes.includes(`id:"${id}"`));assert.equal(getEncounterArt(`companion_${npc}_${id}`).id,daily.id);}
    for (const a of [daily,special,boss,rescue]) {unique.add(a.id);assert.equal(a.type,'characters');assert.equal(artIsUnlocked(a,new Set()),false);}
    assert.equal(rescue.unlock,`${npc}_defeat`);
    assert.equal(artIsUnlocked(rescue,new Set([`${npc}_defeat`])),true);
    assert.equal(artIsUnlocked(boss,new Set(),new Set([boss.id])),true);
  }
  assert.equal(unique.size,12);
  assert.equal(getEncounterArt('companion_kairu_joke'),undefined);
  for (const [name,mapping] of [['event',EVENT_ART],['ending',ENDING_ART]]) assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,'docs/art-integration',`${name}-mapping.json`),'utf8')),mapping);
});


const storyArtMapping = {
  "side_child_1": "passenger_nameless_child",
  "side_child_2": "passenger_nameless_child",
  "side_child_3": "passenger_nameless_child",
  "side_postman_1": "passenger_last_postman",
  "side_postman_2": "passenger_last_postman",
  "side_postman_3": "passenger_last_postman",
  "side_widow_1": "passenger_waiting_woman",
  "side_widow_2": "passenger_waiting_woman",
  "side_widow_3": "passenger_waiting_woman",
  "side_author_1": "passenger_rewriting_author",
  "side_author_2": "passenger_rewriting_author",
  "side_author_3": "passenger_rewriting_author",
  "side_rain": "passenger_rain_bottle",
  "side_portrait": "passenger_faded_portrait",
  "side_clock": "passenger_borrowed_day",
  "side_seed": "passenger_pocket_forest",
  "side_song": "passenger_last_note",
  "side_bridge": "passenger_memory_bridge",
  "side_museum": "passenger_empty_museum",
  "side_mirror": "passenger_other_choice",
  "main_manifest": "main_two_passengers",
  "main_manifest_reply": "main_two_passengers",
  "main_record": "main_two_passengers",
  "main_mail": "main_unsent_letter",
  "main_mail_reply": "main_unsent_letter",
  "main_switch": "main_diverging_tracks",
  "main_switch_reply": "main_diverging_tracks",
  "main_platform": "main_dawn_station",
  "main_platform_reply": "main_dawn_station"
};

test('16 new story images map to all 20 passenger scenes and 9 main scenes', () => {
  assert.equal(Object.keys(storyArtMapping).length, 29);
  const unique = new Set(Object.values(storyArtMapping));
  assert.equal(unique.size, 16);
  for (const [id, artId] of Object.entries(storyArtMapping)) {
    const art = getEncounterArt(id);
    assert.equal(art?.id, artId);
    assert.equal(getEncounterArt(id, [], true)?.id, artId);
    assert.equal(art.type, 'events');
    assert.equal(artIsUnlocked(art, new Set()), false);
    assert.equal(artIsUnlocked(art, new Set(), new Set([artId])), true);
  }
});

test('dawn station appears in three suitable endings; old ending art remains available', () => {
  for (const id of ['true_end','journey_return','journey_stay']) assert.equal(getEndingArt(id)?.id, 'main_dawn_station');
  assert.equal(getEndingArt('journey_depart')?.id, 'planned_04_4_book_notebook');
  const gallery = fs.readFileSync(path.join(root,'src/components/ArtGallery.tsx'),'utf8');
  assert.match(gallery, /true_end: "planned_04_4_book_notebook"/);
  assert.match(gallery, /journey_return: "planned_06_1_letter_reply"/);
  assert.match(gallery, /journey_stay: "planned_02_2_conductors_logbook"/);
  assert.match(gallery, /ids.add\(art.id\)/);
});

// The legacy Seon sheet was actually Rael's. Check image bytes, not just IDs.
test('legacy knight art and its reuse copies contain the verified Seon or ruins illustrations', () => {
  const verified = {
    planned_03_1_cracked_sword: 'characters/cg_seon_1_cracked_sword',
    planned_03_2_ruins_signal: 'characters/cg_seon_2_ruins_signal',
    planned_03_3_last_knight: 'characters/cg_seon_before_boss',
    planned_03_4_argen_outskirts: 'events/reuse_02_4_ruined_window',
    reuse_04_1_ruined_sword: 'characters/cg_seon_1_cracked_sword',
    reuse_04_2_argen_ruins: 'events/reuse_02_4_ruined_window',
    reuse_04_3_fallen_banner: 'characters/cg_seon_before_boss',
    reuse_04_4_archway: 'events/reuse_03_4_ruined_library',
  };
  for (const [id, src] of Object.entries(verified)) {
    const art = ALL_ART.find(x => x.id === id);
    assert.ok(art, id);
    assert.deepEqual(fs.readFileSync(path.join(root, 'public', art.src)), fs.readFileSync(path.join(root, 'public/art', `${src}.webp`)), id);
  }
  for (const [id, expected] of Object.entries({seon_2:'planned_03_4_argen_outskirts',seon_3:'planned_03_3_last_knight',seon_final_choice:'planned_03_3_last_knight'})) {
    assert.equal(getEncounterArt(id)?.id, expected);
    assert.equal(getEncounterArt(id, ['route_rael_happy','romance_rael_promise'], true)?.id, expected);
  }
  assert.equal(getEndingArt('seon_route_bad')?.id, 'planned_03_3_last_knight');
  assert.equal(getEndingArt('seon_route_normal')?.id, 'planned_03_4_argen_outskirts');
});
