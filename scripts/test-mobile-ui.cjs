// Component structure checks using TypeScript JSX output and real store actions.
// The React hook/JSX stand-ins do not exercise DOM rendering or lifecycle effects.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const {test, assert, run, useRun, localRequire} = require('./test-p1.cjs');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file),'utf8');
const jsx = (type, props) => ({type, props:props || {}});
function component(name) {
  const file = `src/components/${name}.tsx`;
  const code = ts.transpileModule(read(file), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX},fileName:file}).outputText;
  const mod={exports:{}};
  const req = id => {
    if (id==='react') return {useState:v=>[v,()=>{}],useEffect:()=>{},useRef:()=>({current:null}),useMemo:fn=>fn()};
    if (id==='react/jsx-runtime') return {jsx,jsxs:jsx,Fragment:'fragment'};
    if (id==='./SceneView') return {default:()=>null};
    return localRequire(id.replace(/^\.\.\//,'./src/')+'.js');
  };
  new Function('require','module','exports',code)(req,mod,mod.exports);
  return mod.exports.default;
}
function all(node, predicate) {
  if (Array.isArray(node)) return node.flatMap(child=>all(child,predicate));
  if (!node || typeof node!=='object' || !node.props) return [];
  return [...(predicate(node)?[node]:[]), ...all(node.props.children,predicate)];
}
function text(node){if(Array.isArray(node))return node.map(text).join('');if(node==null||typeof node==='boolean')return '';if(typeof node==='object')return text(node.props?.children);return String(node);}
function findButton(tree,label){return all(tree,n=>n.type==='button'&&text(n).includes(label))[0];}
const BattlePanel=component('BattlePanel');
const ShopPanel=component('ShopPanel');
function battleState(){
  run().startRun('mobile-potions');
  useRun.setState({status:'battle',hp:20,maxHp:60,mp:5,maxMp:40,healthPotions:2,focusPotions:2,autoBattle:false,battle:{enemy:{id:'test',name:'이야기의 끝 — 마지막 장',hp:345,maxHp:345,atk:25,exp:0,gold:0},turn:3,log:[]}});
}
test('mobile battle dock wires quick potions to existing guarded actions',()=>{
  battleState();let tree=BattlePanel();const heal=findButton(tree,'체력 물약'),focus=findButton(tree,'집중력 물약');
  assert.ok(heal&&!heal.props.disabled);assert.ok(focus&&!focus.props.disabled);
  heal.props.onClick();focus.props.onClick();
  assert.ok(run().hp>20&&run().mp>5);assert.equal(run().healthPotions,1);assert.equal(run().focusPotions,1);assert.equal(run().battle.turn,3);
});
test('mobile potion controls disable under auto battle or when resources are full',()=>{
  battleState();useRun.setState({autoBattle:true});let tree=BattlePanel();
  assert.ok(findButton(tree,'체력 물약').props.disabled);assert.ok(findButton(tree,'집중력 물약').props.disabled);
  useRun.setState({autoBattle:false,hp:60,mp:40});tree=BattlePanel();
  assert.ok(findButton(tree,'체력 물약').props.disabled);assert.ok(findButton(tree,'집중력 물약').props.disabled);
});
test('shop accordion groups preserve every item and the exit control',()=>{
  run().startRun('mobile-shop');
  const items=['heal','mana','weapon','armor','luck','stat'].map((effect,i)=>({id:`item-${i}`,name:`상품 ${i}`,effect,amount:1,price:10,stock:1}));
  useRun.setState({status:'shop',shopItems:items,shopCharms:[],gold:0});
  const tree=ShopPanel();const categories=all(tree,n=>n.type==='details'&&n.props.className==='shop-category');
  assert.equal(categories.length,3);assert.deepEqual(categories.map(n=>all(n,c=>c.type==='button').length),[2,3,1]);
  for(let i=0;i<6;i++){const b=findButton(tree,`상품 ${i}`);assert.ok(b.props.disabled);assert.ok(text(b).includes('골드 부족'));}
  assert.ok(findButton(tree,'상인을 떠난다'));
});
test('archive tabs keep all original sections and discovery gate',()=>{
  const archive=read('src/components/ArchiveModal.tsx');const gallery=read('src/components/ArtGallery.tsx');
  for(const id of ['history','endings','art','settings'])assert.ok(archive.includes(`section === "${id}"`));
  assert.ok(archive.includes('<SlotSwitcher />')&&archive.includes('<JourneyRecallModal')&&archive.includes('<EndingRecallModal'));
  assert.ok(gallery.includes('list.filter(art => artIsUnlocked(art, collected, discovered))'));
  assert.ok(gallery.includes('아직 발견하지 못한 삽화'));
});
test('mobile scroll resets follow both page transitions and encounter outcomes',()=>{
  assert.ok(read('src/App.tsx').includes('key={`${activeSlot}:${status}:${pageKey}`}'));
  assert.ok(read('src/components/EventModal.tsx').includes('closest(".adventure-layout")?.scrollTo({ top: 0 })'));
});
