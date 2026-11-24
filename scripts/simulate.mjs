// 사용: node scripts/simulate.mjs [횟수] [orig|grind|hybrid]
//   STAT=body|resonance|will|insight|wisdom|charm → 해당 능력치 집중 투자 (기본: mixed, 5개 스탯 순환)
// 전략: orig=이벤트 우선, grind=전투 우선, hybrid=이벤트+전투. 자동전투 규칙은 src/lib/combat.ts 를 그대로 사용한다.
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));
const STAT = process.env.STAT ?? "mixed";
const destination = process.env.DESTINATION ?? "return";
if (!["return", "stay", "depart", "archive"].includes(destination)) throw new Error("Invalid destination");
const runs = Number(process.argv[2] ?? 300);
const strat = process.argv[3] ?? "hybrid";
if (!Number.isSafeInteger(runs) || runs < 1 || !["orig", "grind", "hybrid"].includes(strat)) throw new Error("Invalid run count or strategy");
let useRun, ENCOUNTERS, audio, autoBattleAction, isChoiceAvailable, resolveRunEndings;
if (process.env.SIM_OFFLINE === "1") {
  const { localRequire } = require("./store-test-runtime.cjs");
  ({ useRun } = localRequire("./src/store/useRun.js"));
  ({ ENCOUNTERS } = localRequire("./src/data/encounters.js"));
  ({ audio } = localRequire("./src/lib/audio.js"));
  ({ autoBattleAction } = localRequire("./src/lib/combat.js"));
  ({ isChoiceAvailable } = localRequire("./src/lib/encounterChoice.js"));
  ({ resolveRunEndings } = localRequire("./src/lib/ending.js"));
  console.log("Offline store test: React/Zustand/storage stand-ins");
} else {
  const { build } = createRequire(require.resolve("vite/package.json"))("esbuild");
  const { outputFiles } = await build({ stdin: { contents: [
    'export { useRun } from "./src/store/useRun.ts";',
    'export { ENCOUNTERS } from "./src/data/encounters.ts";',
    'export { audio } from "./src/lib/audio.ts";',
    'export { autoBattleAction } from "./src/lib/combat.ts";',
    'export { isChoiceAvailable } from "./src/lib/encounterChoice.ts";',
    'export { resolveRunEndings } from "./src/lib/ending.ts";',
  ].join("\n"), resolveDir: root, sourcefile: "sim.ts", loader: "ts" }, bundle: true, platform: "node", format: "esm", write: false });
  globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  ({ useRun, ENCOUNTERS, audio, autoBattleAction, isChoiceAvailable, resolveRunEndings } = await import("data:text/javascript;base64," + Buffer.from(outputFiles[0].contents).toString("base64")));
}
audio.sfx = () => {};
let seed = 123456789;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };

const res = [];
for (let i = 0; i < runs; i++) {
  useRun.getState().startRun(`sim-${i}`);
  useRun.getState().skipPrologue();
  useRun.getState().choosePrologue(0);
  let a = 0, bossArrival = null; const bossLog={}, bossWins={};
  while (useRun.getState().status !== "ended" && a++ < 3000) {
    const s = useRun.getState();
    if (s.pendingWeaponPrompt) { s.equipWeapon(s.pendingWeaponPrompt.weaponId); continue; }
    switch (s.status) {
      case "storySelect": s.selectStory("unnamed_station"); break;
      case "storyOpening": s.chooseStoryOpening(0); break;
      case "interlude": s.chooseInterlude(0); break;
      case "finalChoice": s.chooseFinalDestination(destination); break;
      case "choosing": {
        const rotating = process.env.EXPLORE_ROTATE === "1" && strat !== "grind";
        const eventOrder = [n => n.type === "event" && !n.encounterId, n => n.id.endsWith("reunion"), n => n.id.endsWith("side")];
        const target = process.env.TARGET_NPC;
        const targetReunion = target ? s.choices.find(n => n.encounterId && ENCOUNTERS.find(e=>e.id===n.encounterId)?.npcId===target) : undefined;
        const preferred = (process.env.QUIET_VISIT === "1" ? s.choices.find(n => n.id.endsWith("personality")) : undefined) ?? targetReunion ?? (rotating ? [0,1,2].map(offset => eventOrder[(s.floor + s.act + i + offset) % 3]).map(predicate => s.choices.find(predicate)).find(Boolean) : undefined);
        const find = (t) => (t === "event" && preferred ? preferred : undefined) ?? (t === "event" && strat !== "grind" && process.env.REUNION !== "0" ? (process.env.SIDE_FIRST === "1" ? s.choices.find(n => n.id.endsWith("side")) : undefined) ?? s.choices.find(n => n.encounterId) : undefined) ?? s.choices.find((n) => n.type === t);
        const node = strat==="hybrid"
          ? ((s.hp < s.maxHp*0.5 && find("rest")) || (s.gold>=24 && (s.healthPotions<3||s.mp<s.maxMp-15) && find("shop")) || find("event") || (s.hp>=s.maxHp*0.65 && (find("battle")||find("elite"))) || find("rest") || find("treasure") || s.choices[0])
          : strat==="grind"
          ? ((s.hp < s.maxHp*0.55 && find("rest")) || (s.gold>=24 && (s.healthPotions<3||s.mp<s.maxMp-15) && find("shop")) || (s.hp>=s.maxHp*0.5 && (find("battle")||find("elite"))) || find("rest") || find("event") || find("treasure") || s.choices[0])
          : (s.hp < s.maxHp*0.6 && find("rest")) || (s.gold>=25 && s.mp < s.maxMp-15 && find("shop")) || find("event") || (s.hp < s.maxHp*0.85 && find("rest")) || find("battle") || find("elite") || s.choices[0];
        if (node.type==="boss") bossLog[s.act]={hp:s.hp,maxHp:s.maxHp,lv:s.level,aff:Math.max(...Object.values(s.affinity)),will:s.stats.will,res:s.stats.resonance,weapon:s.weaponPower,armor:s.armorPower,hpPot:s.healthPotions};
        if (node.type==="boss" && s.act===3) bossArrival = {hp:s.hp,maxHp:s.maxHp,mp:s.mp,lv:s.level,stats:{...s.stats},weapon:s.weaponPower,armor:s.armorPower,aff:{...s.affinity}};
        s.selectNode(node); break; }
      case "rel": {
        if (s.encounterOutcome) { s.continueEncounter(); break; }
        const enc = ENCOUNTERS.find((x) => x.id === s.activeEncounter);
        const available = enc.choices.map((choice, index) => ({choice,index})).filter(({choice}) => isChoiceAvailable(choice,s.flags,s.stats));
        const targetChoice = process.env.TARGET_NPC === "kairu" && enc.id === "kairu_3" ? available.find(({choice})=>choice.require?.flag === "story_kairu_authorship") : undefined;
        const selected = targetChoice ?? (process.env.CHOICE_POLICY === "random" ? available[Math.floor(Math.random() * available.length)] : undefined) ?? (process.env.ROMANCE === "1" ? available.find(({choice}) => choice.result.setFlags?.some(f=>/^romance_.*_promise$/.test(f))) : undefined) ?? available.find(({choice}) => (choice.result.affinity ?? 0) > 0 && !choice.check) ?? available[0];
        if (!selected) throw new Error("No available encounter choice: " + enc.id);
        s.resolveEncounterChoice(selected.index); break; }
      case "battle": {
        const action = autoBattleAction(s.battle,s);
        if (action === "brace") s.playerBrace(); else if (action === "potion") s.autoHealingPotion(); else if (action === "focusPotion") s.autoFocusPotion(); else if (action === "skill") s.playerSkill(); else s.playerAttack();
        const after = useRun.getState();
        if (s.current?.type === "boss" && !after.battle && !after.nodeResult?.rescued && after.nodeResult?.endsRun !== "death" && after.nodeResult?.endsRun !== "defeat") bossWins[s.act] = true;
        break; }
      case "shop": {
        const items = s.shopItems ?? [];
        const heal = items.find(i=>i.effect==="heal" && (i.stock===undefined||i.stock>0)), mana = items.find(i=>i.effect==="mana" && (i.stock===undefined||i.stock>0));
        if (strat!=="orig") {
          if (heal && s.gold>=heal.price && s.healthPotions<5) s.buyItem(heal.id);
          else if (mana && s.gold>=mana.price && s.focusPotions<4) s.buyItem(mana.id);
          else s.closeShop();
        } else {
          if (mana && s.focusPotions<5 && s.gold>=mana.price && s.mp<s.maxMp-10) s.buyItem(mana.id);
          else if (heal && s.healthPotions<5 && s.gold>=heal.price && s.hp<s.maxHp-15) s.buyItem(heal.id);
          else s.closeShop();
        }
        break; }
      case "levelup": if (s.statPoints>0) { const rot=["body","resonance","will","insight","wisdom"]; const t = [...rot,"charm"].includes(STAT) ? STAT : rot[(s.statPoints+s.level)%rot.length]; s.distributeStat(t); } else s.closeLevelUp(); break;
      case "resolving": s.advanceFloor(); break;
      default: throw new Error("state "+s.status);
    }
  }
  const s = useRun.getState();
  if (s.status !== "ended") throw new Error("Run did not terminate: " + i);
  res.push({ actions:a, seen:s.seenEncounters, bossLog, bossWins, flags:s.flags, ending:resolveRunEndings(s.flags,s.nodeResult?.endsRun === "victory").journey.id, victory: s.nodeResult?.endsRun === "victory", act: s.act, floor: s.floor, status: s.status, bossArrival, lv: s.level, aff: s.affinity });
}
const v = res.filter(r=>r.victory).length;
console.log("status:", JSON.stringify(res.reduce((m,r)=>(m[r.status]=(m[r.status]||0)+1,m),{})));
console.log(`runs ${runs} · victories ${v} (${(v/runs*100).toFixed(1)}%)`);
for (const act of [1,2,3]) { const d = res.filter(r=>!r.victory && r.act===act); console.log(`not cleared act${act}: ${d.length}  floors:`, JSON.stringify(d.reduce((m,r)=>(m[r.floor]=(m[r.floor]||0)+1,m),{}))); }
const arr = res.filter(r=>r.bossArrival);
console.log(`reached act3 boss node: ${arr.length}`);
if (arr.length) { const avg=(f)=>(arr.reduce((t,r)=>t+f(r),0)/arr.length).toFixed(1); console.log(`avg at boss arrival: HP ${avg(r=>r.bossArrival.hp)}/${avg(r=>r.bossArrival.maxHp)} MP ${avg(r=>r.bossArrival.mp)} Lv ${avg(r=>r.bossArrival.lv)} weapon ${avg(r=>r.bossArrival.weapon)} armor ${avg(r=>r.bossArrival.armor)}`); console.log("  win rate once at boss:", (arr.filter(r=>r.victory).length/arr.length*100).toFixed(1)+"%"); }
console.log("avg final level", (res.reduce((t,r)=>t+r.lv,0)/runs).toFixed(1));

console.log("\n[막 보스 도전/승리]");
for (const act of [1,2,3]) {
  const tried = res.filter(r=>r.bossLog[act]);
  const won = tried.filter(r=> r.bossWins[act]);
  console.log(` ${act}막 보스: 도전 ${tried.length} / 승리 ${won.length} (${tried.length? (won.length/tried.length*100).toFixed(0):0}%)`);
  const bk=[[0,10],[10,20],[20,30],[30,101]];
  for (const [lo,hi] of bk){ const g=tried.filter(r=>r.bossLog[act].aff>=lo&&r.bossLog[act].aff<hi); if(!g.length) continue; const w=g.filter(r=> r.bossWins[act]).length; console.log(`    최고호감 ${lo}~${hi-1}: ${g.length}회 중 ${w}승 (${(w/g.length*100).toFixed(0)}%)`);}
  if (tried.length){const av=(f)=>(tried.reduce((t,r)=>t+f(r.bossLog[act]),0)/tried.length).toFixed(1); console.log(`    도착시 평균: Lv ${av(b=>b.lv)} HP ${av(b=>b.hp)}/${av(b=>b.maxHp)} 호감 ${av(b=>b.aff)} 의지 ${av(b=>b.will)} 감수성 ${av(b=>b.res)} 무기 ${av(b=>b.weapon)}`);}
}

console.log("Rescues:",res.filter(r=>r.flags.some(f=>f.startsWith("rescued_"))).length,"Final rescue endings:",res.filter(r=>r.ending.endsWith("_defeat")).length,"Deaths:",res.filter(r=>r.ending==="death").length);
console.log("Ending counts:",JSON.stringify(res.reduce((m,r)=>(m[r.ending]=(m[r.ending]||0)+1,m),{})));

console.log("Route completion:", JSON.stringify(Object.fromEntries(["rael","seon","kairu"].map(npc=>[npc,res.filter(r=>r.flags.some(f=>f.startsWith(`route_${npc}_`))).length]))));
console.log("Mean completed routes:",(res.reduce((sum,r)=>sum+r.flags.filter(f=>/^route_(rael|seon|kairu)_(bad|normal|happy)$/.test(f)).length,0)/runs).toFixed(2));
console.log("Any completed route:",res.filter(r=>r.flags.some(f=>/^route_(rael|seon|kairu)_/.test(f))).length);
console.log("Companion scene coverage:",new Set(res.flatMap(r=>r.seen.filter(id=>id.startsWith("companion_")))).size);
console.log("Boss support:",JSON.stringify(Object.fromEntries(["rael","seon","kairu"].map(npc=>[npc,res.filter(r=>r.flags.includes(`boss_support_${npc}`)).length]))));

const completed = res.filter(r=>r.victory);
const mean = (rows, fn) => rows.length ? (rows.reduce((sum,r)=>sum+fn(r),0)/rows.length).toFixed(1) : "n/a";
console.log("Completed run mean store actions:",mean(completed,r=>r.actions),"mean distinct encounters:",mean(completed,r=>r.seen.length),"mean new main scenes:",mean(completed,r=>r.seen.filter(id=>id.startsWith("main_")).length));

const sideIds = [...new Set(res.flatMap(r=>r.seen.filter(id=>id.startsWith("side_"))))];
console.log("Passenger scene coverage:", sideIds.length, "/ 20");
console.log("Any passenger story:", res.filter(r=>r.seen.some(id=>id.startsWith("side_"))).length);
console.log("Passenger scenes per completed run:", mean(completed,r=>r.seen.filter(id=>id.startsWith("side_")).length));
console.log("Passenger three-part completions:", JSON.stringify(Object.fromEntries(["child","postman","widow","author"].map(id=>[id,res.filter(r=>r.seen.includes(`side_${id}_3`)).length]))));

const commonFinals = ["train_letter_echo","train_seat_owner","train_ticket_station","train_missing_minute","train_window_station_echo","train_page_reader"];
console.log("Common chain completions:", res.reduce((n,r)=>n+r.seen.filter(id=>commonFinals.includes(id)).length,0));
console.log("All encountered IDs:",new Set(res.flatMap(r=>r.seen)).size,"/",ENCOUNTERS.length);
console.log("Any three-part passenger completion:",res.filter(r=>r.seen.some(id=>/^side_(child|postman|widow|author)_3$/.test(id))).length);

console.log("Romance promises:",res.filter(r=>r.flags.some(f=>/^romance_.*_promise$/.test(f))).length,"Romance scenes:",new Set(res.flatMap(r=>r.seen.filter(id=>id.startsWith("romance_scene_")))).size,"Romance scene visits:",res.reduce((n,r)=>n+r.seen.filter(id=>id.startsWith("romance_scene_")).length,0));

const endingCoverage = {};
for (const r of res) {
  const resolution = resolveRunEndings(r.flags, r.victory);
  for (const ending of [resolution.journey, ...resolution.routes, ...resolution.bonuses]) endingCoverage[ending.id] = (endingCoverage[ending.id] ?? 0) + 1;
}
console.log("All ending awards:", JSON.stringify(endingCoverage));

const personalityIds = ENCOUNTERS.filter(e=>e.id.includes('_personality_')||e.id==='personality_shared_table').map(e=>e.id);
if (personalityIds.length) console.log('Personality scene visits:',JSON.stringify(Object.fromEntries(personalityIds.map(id=>[id,res.filter(r=>r.seen.includes(id)).length]))));
