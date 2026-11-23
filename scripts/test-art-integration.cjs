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

test('art catalogue contains the expected 64 optimized assets', () => {
  assert.equal(ALL_ART.length, 64);
  assert.deepEqual([count('events'), count('characters'), count('items')], [40, 12, 12]);
  assert.equal(new Set(ALL_ART.map(e=>e.id)).size, 64);
  for (const art of ALL_ART) {
    assert.match(art.src, /^\/art\/(events|characters|items)\/[\w-]+\.webp$/);
    const p = path.join(root, 'public', art.src.replace(/^\//,''));
    assert.ok(fs.statSync(p).size > 1000, `image missing/empty: ${p}`);
  }
});

test('every P4 encounter has an image, including non-romantic story events', () => {
  assert.equal(Object.keys(EVENT_ART).length, 33);
  for (const id of Object.keys(EVENT_ART)) assert.ok(getEncounterArt(id), `missing art for ${id}`);
  assert.equal(getEncounterArt('rael_tea')?.id, 'planned_02_3_cooling_tea');
  assert.equal(getEncounterArt('kairu_promise')?.id, 'planned_05_2_unread_promise');
  assert.equal(getEncounterArt('train_empty_seat')?.id, 'planned_06_2_returned_coat');
});

test('character HAPPY and relationship ending CGs are separate', () => {
  assert.equal(Object.keys(ENDING_ART).length, 18);
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
  assert.deepEqual(Object.keys(SHOP_ART).sort(), ['mana','potion','will_up','wisdom_up'].sort());
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
