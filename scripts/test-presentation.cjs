const fs = require('node:fs');
const path = require('node:path');
const { test, assert, localRequire, run } = require('./test-p1.cjs');
const { openingRevealMs, previewDie } = localRequire('./src/lib/presentation.js');
const { usePresentation } = localRequire('./src/store/usePresentation.js');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
test('presentation timing is short and disabled for quick mode, OS reduced motion or ongoing battle',()=>{
  assert.equal(openingRevealMs(true,false,1,true),420);
  for(const args of [[false,false,1,true],[true,true,1,true],[true,false,2,true],[true,false,1,false]]) assert.equal(openingRevealMs(...args),0);
});
test('cosmetic dice is deterministic, in range and never reads gameplay randomness',()=>{
  const original=Math.random;
  try { Math.random=()=>{throw new Error('gameplay RNG used');}; const values=Array.from({length:20},(_,i)=>previewDie(i)); assert.equal(new Set(values).size,20); assert.ok(values.every(v=>v>=1&&v<=20)); }
  finally { Math.random=original; }
  assert.doesNotMatch(read('src/lib/audio.ts'),/Math\.random\(/);
});
test('motion preference persists independently and never changes journey state',()=>{
  run().startRun('presentation-preference');const previous=JSON.stringify(run());
  assert.equal(usePresentation.getState().motionEnabled,true);usePresentation.getState().toggleMotion();assert.equal(usePresentation.getState().motionEnabled,false);
  assert.equal(JSON.stringify(run()),previous);usePresentation.getState().toggleMotion();assert.equal(usePresentation.getState().motionEnabled,true);
  const config=localRequire('zustand/middleware').__options['endless-archive-presentation'];assert.ok(config);
});
test('battle reveal cleans up timers and does not replay after revealing or advancing turns',()=>{
  const code=read('src/components/BattlePanel.tsx');
  assert.match(code,/hasRevealed\.current/);assert.match(code,/\[openingRoll, motionEnabled, turn\]/);assert.match(code,/clearInterval\(interval\)/);assert.match(code,/clearTimeout\(timer\)/);assert.match(code,/removeEventListener\("change", onPreference\)/);
  assert.match(code,/disabled=\{autoBattle\}/);assert.doesNotMatch(code,/disabled=\{[^}]*rollRevealed/);
});
test('scene and outcome have separate reveal keys and existing scroll reset',()=>{
  const code=read('src/components/EventModal.tsx');assert.ok(code.includes('key={`${ev.id}:${encounterOutcome ? "result" : "intro"}`}'));assert.ok(code.includes('key={sceneArt?.id}'));assert.ok(code.includes('closest(".adventure-layout")?.scrollTo({ top: 0 })'));
});
test('page sound respects existing mute gate and does not layer click',()=>{
  const app=read('src/App.tsx'),audio=read('src/lib/audio.ts');assert.match(app,/audio\.sfx\(button\.dataset\.sfx === "page" \? "page" : "click"\)/);assert.match(audio,/if \(this\.muted\) return;/);assert.match(audio,/case "page": this\.noise\(0\.10, 0\.055\)/);
});
test('settings and CSS support quick and reduced-motion presentation',()=>{
  assert.match(read('src/components/StatusBar.tsx'),/onClick=\{toggleMotion\} aria-pressed=\{motionEnabled\}/);
  assert.match(read('src/App.tsx'),/dataset\.motion = motionEnabled \? "full" : "quick"/);
  const css=read('src/index.css');assert.match(css,/@media \(prefers-reduced-motion: no-preference\)/);assert.match(css,/:root:not\(\[data-motion="quick"\]\) \.story-prose--reveal/);
});
