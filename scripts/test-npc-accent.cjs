// Real character metadata and JSX wiring; no DOM or hook lifecycle simulation.
const {test,assert,localRequire,run,useRun,ENCOUNTERS}=require('./test-p1.cjs');
const fs=require('node:fs');const path=require('node:path');const ts=require('typescript');
const {NPCS}=localRequire('./src/data/npcs.js');
const {npcAccent}=localRequire('./src/lib/npcAccent.js');
const {ENDING_CATALOG}=localRequire('./src/data/endings.js');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const jsx=(type,props)=>({type,props:props||{}});
function component(name){
 const file=`src/components/${name}.tsx`;
 const code=ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX},fileName:file}).outputText;
 const mod={exports:{}};
 const req=id=>{
  if(id==='react')return {useEffect:()=>{},useRef:()=>({current:null})};
  if(id==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:'fragment'};
  if(id.startsWith('./'))return {default:()=>null};
  if(id.endsWith('.webp'))return {default:id};
  return localRequire(id.replace(/^\.\.\//,'./src/')+'.js');
 };
 new Function('require','module','exports',code)(req,mod,mod.exports);return mod.exports.default;
}
function all(node,predicate){if(Array.isArray(node))return node.flatMap(n=>all(n,predicate));if(!node||typeof node!=='object'||!node.props)return [];return [...(predicate(node)?[node]:[]),...all(node.props.children,predicate)];}
const ids=['rael','seon','kairu'];
test('each character has one distinct, restrained accent; unknown IDs are neutral',()=>{
 assert.equal(new Set(ids.map(id=>NPCS[id].color)).size,3);
 for(const id of ids){assert.match(NPCS[id].color,/^#[0-9a-f]{6}$/i);assert.deepEqual(npcAccent(id),{'data-npc':id,style:{'--npc-accent':NPCS[id].color}});}
 for(const id of [null,undefined,'','side_rael','constructor','__proto__'])assert.deepEqual(npcAccent(id),{});
});
test('only explicit known NPC destinations show a route accent; random exploration is neutral',()=>{
 const Panel=component('NodeChoicePanel');run().startRun('accent-test');
 const targets=[...ids.map(id=>ENCOUNTERS.find(e=>e.npcId===id)), ENCOUNTERS.find(e=>!e.npcId),null];
 useRun.setState({choices:targets.map((e,i)=>({id:`choice-${i}`,type:'event',title:e?.title??'새로운 이야기',preview:'',encounterId:e?.id}))});
 const buttons=all(Panel(),n=>n.type==='button');assert.equal(buttons.length,5);
 buttons.forEach((b,i)=>{assert.equal(b.props['data-npc'],targets[i]?.npcId??undefined);assert.equal(b.props.style?.['--npc-accent'],targets[i]?.npcId?NPCS[targets[i].npcId].color:undefined);});
});
test('all encounter and ending metadata resolve consistently with no neutral scene colouring',()=>{
 for(const entry of [...ENCOUNTERS,...ENDING_CATALOG]){const a=npcAccent(entry.npcId);assert.equal(a['data-npc'],entry.npcId??undefined);assert.equal(a.style?.['--npc-accent'],entry.npcId?NPCS[entry.npcId].color:undefined);}
 const event=read('src/components/EventModal.tsx');assert.match(event,/npcAccent\(npc\?\.id\)/);assert.match(event,/npc = ev\.npcId \? NPCS\[ev\.npcId\]/);
 const notebook=read('src/components/JourneyNotebook.tsx');assert.match(notebook,/npcAccent\(group\.id\)/);
 for(const f of ['EndingScreen','JourneyRecallModal']){const source=read(`src/components/${f}.tsx`);assert.match(source,/npcAccent\(route\.npcId\)/);assert.match(source,/npcAccent\(bonus\.npcId\)/);}
});
test('character styling is scoped to explicit data attributes; no global background tint',()=>{
 const css=read('src/index.css').split('/* Character signatures')[1];assert.ok(css);
 assert.match(css,/\.npc-edge\[data-npc\]\s*\{\s*border-left: 3px solid var\(--npc-accent\)/);
 assert.match(css,/\.npc-heading\[data-npc\]\s*\{\s*border-left: 2px solid var\(--npc-accent\)/);
 assert.doesNotMatch(css,/background(?:-color)?:/);
});
