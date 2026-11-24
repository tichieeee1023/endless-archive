const {test,assert,run,useRun,localRequire,persistenceOptions}=require('./test-p1.cjs');
const fs=require('node:fs');const path=require('node:path');
const {migrateLegacySave}=localRequire('./src/lib/saveCompatibility.js');
const config=persistenceOptions['endless-archive-run'];
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const storage=(initial={})=>{const data=new Map(Object.entries(initial));return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
test('legacy save moves before slot hydration and is never overwritten by migration',()=>{
 const s=storage({'endless-archive-run':'old'});migrateLegacySave(s);assert.equal(s.getItem('endless-archive-run_slot1'),'old');assert.equal(s.getItem('endless-archive-run'),null);
 const both=storage({'endless-archive-run':'old','endless-archive-run_slot1':'new'});migrateLegacySave(both);assert.equal(both.getItem('endless-archive-run_slot1'),'new');assert.equal(both.getItem('endless-archive-run'),'old');
 assert.match(read('src/store/useRun.ts'),/getItem: \(name\) => \{\s*migrateLegacySave\(localStorage\)/);
 assert.doesNotMatch(read('src/main.tsx'),/migrateOldSave/);
});
test('failed migration preserves the original save',()=>{
 const s=storage({'endless-archive-run':'old'});s.setItem=()=>{throw new Error('quota');};assert.throws(()=>migrateLegacySave(s));assert.equal(s.getItem('endless-archive-run'),'old');
});
test('weapon prompt is persisted and restored only when the owning slot has the weapon',()=>{
 run().startRun('weapon-prompt');const weapon={id:'test-w',name:'test',power:2,value:5};const prompt={weaponId:weapon.id,source:'purchase'};
 useRun.setState({ownedWeapons:[weapon],pendingWeaponPrompt:prompt});const snapshot=JSON.parse(JSON.stringify(config.partialize(run())));
 assert.deepEqual(snapshot.pendingWeaponPrompt,prompt);assert.deepEqual(config.merge(snapshot,run()).pendingWeaponPrompt,prompt);
 assert.equal(config.merge({...snapshot,ownedWeapons:[]},run()).pendingWeaponPrompt,null);
 const old={...snapshot};delete old.pendingWeaponPrompt;assert.equal(config.merge(old,run()).pendingWeaponPrompt,null);
});
test('shared seed requests confirmation before replacing a live journey and reset removes legacy fallback',()=>{
 assert.match(read('src/App.tsx'),/run\.status === "ended" \|\| window\.confirm/);
 const code=read('src/components/ArchiveModal.tsx');assert.match(code,/run\.status !== "ended" && !window\.confirm/);assert.match(code,/localStorage\.removeItem\("endless-archive-run"\)/);
});
test('release branding uses full title and new existing icon files',()=>{
 const config=read('vite.config.ts');assert.match(config,/short_name: "종점 없는 서고"/);assert.match(config,/name: "종점 없는 서고"/);assert.doesNotMatch(config,/무한서고/);
 const html=read('index.html');assert.match(html,/<title>종점 없는 서고<\/title>/);for(const file of ['archive-mark-v3.svg','archive-mark-v3-192.png','archive-mark-v3-512.png','archive-mark-v3-maskable.png','archive-mark-v3-touch.png'])assert.ok(fs.statSync(path.join(__dirname,'..','public',file)).size>0);
});
