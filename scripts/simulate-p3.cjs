// 종점 없는 서고 P3: 지도/인카운터 출현 기회 시뮬레이션 (전투 피해·사망률은 측정하지 않음)
// 사용: npm run sim:p3  또는 node scripts/simulate-p3.cjs 2000 [비교할 이전 프로젝트 폴더]
// 로컬 TypeScript 변환만 사용하며 React/Zustand/Vite 실행은 필요 없다.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createRequire } = require('node:module');
const ts = require('typescript');
const runs = Number(process.argv[2] ?? 2000);
if (!Number.isSafeInteger(runs) || runs < 1 || runs > 100000) {
  throw new Error('회차 수는 1~100000의 정수여야 합니다.');
}
const previous = process.argv[3] ? path.resolve(process.argv[3]) : null;
const tempDirs = [];
process.on('exit', () => tempDirs.forEach(dir => fs.rmSync(dir, { recursive: true, force: true })));

function loadGame(projectRoot) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'archive-p3-sim-'));
  tempDirs.push(dir);
  fs.writeFileSync(path.join(dir, 'package.json'), '{"type":"commonjs"}');
  const files = [
    'src/lib/rng.ts', 'src/lib/mapgen.ts', 'src/lib/check.ts',
    'src/lib/encounterChoice.ts', 'src/lib/storyProgress.ts',
    'src/data/memories.ts', 'src/data/encounters.ts',
    'src/lib/encounterPool.ts', 'src/data/independentEncounters.ts',
  ];
  for (const file of files) {
    if (!fs.existsSync(path.join(projectRoot, file))) continue;
    const source = fs.readFileSync(path.join(projectRoot, file), 'utf8');
    const js = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const dest = path.join(dir, file.replace(/\.ts$/, '.js'));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, js);
  }
  const load = createRequire(path.join(dir, 'package.json'));
  const { generateChoices } = load('./src/lib/mapgen.js');
  const { mulberry32, hashSeed } = load('./src/lib/rng.js');
  const { ENCOUNTERS } = load('./src/data/encounters.js');
  const { successChance } = load('./src/lib/check.js');
  const { isChoiceAvailable } = load('./src/lib/encounterChoice.js');
  const { STORY_PROGRESS } = load('./src/lib/storyProgress.js');
  let pick;
  if (fs.existsSync(path.join(projectRoot, 'src/lib/encounterPool.ts'))) {
    pick = load('./src/lib/encounterPool.js').pickWeightedEncounter;
  } else {
    pick = (items, act, flags, seen, random) => {
      const pool = items.filter(e => e.weight > 0 && (!e.minAct || act >= e.minAct)
        && (e.once === false || !seen.includes(e.id))
        && !e.requiresAll?.some(f => !flags.includes(f))
        && !e.requiresNone?.some(f => flags.includes(f)));
      if (!pool.length) return null;
      let roll = random() * pool.reduce((sum, e) => sum + e.weight, 0);
      for (const e of pool) { roll -= e.weight; if (roll < 0) return e.id; }
      return pool[pool.length - 1].id;
    };
  }
  return { generateChoices, mulberry32, hashSeed, ENCOUNTERS, successChance, isChoiceAvailable, STORY_PROGRESS, pick };
}

function simulate(game, n, strategy) {
  const stats = { wisdom: 4, insight: 4, will: 4, resonance: 4, body: 4, charm: 4 };
  const aggregate = {
    eventOffered: 0, battleOffered: 0, events: 0, battles: 0, otherNodes: 0,
    ambient: 0, firstNpc: 0, nextNpc: 0, specialNpc: 0, noEventPool: 0,
    routeDecisions: 0, uniqueEncounterIds: new Set(), totalFloorChoices: 0,
    perRunAmbient: [], perRunNpc: [],
  };
  const lookup = new Map(game.ENCOUNTERS.map(e => [e.id, e]));
  for (let i = 0; i < n; i++) {
    const random = game.mulberry32(game.hashSeed(`encounter-draw-${i}`));
    const flags = [];
    const seen = [];
    let ambient = 0, npc = 0;
    const handle = (id, depth = 0) => {
      if (!id || depth > 6) return;
      const enc = lookup.get(id);
      if (!enc) throw new Error('존재하지 않는 인카운터: ' + id);
      aggregate.uniqueEncounterIds.add(id);
      if (enc.npcId) {
        npc++;
        if (enc.kind === 'chain') aggregate.nextNpc++;
        else if (enc.requiresAll?.length) aggregate.specialNpc++;
        else aggregate.firstNpc++;
      } else {
        aggregate.ambient++;
        ambient++;
      }
      const options = enc.choices.filter(c => game.isChoiceAvailable(c, flags, stats));
      // 사건을 우선 해결하되, 연애를 선택하지 않는 일반 모험가의 선택 전략.
      // 공통 사건은 두 선택 모두 실제 플레이에서 가능한 경로이므로 번갈아 탐색한다.
      const variedNeutralChoice = ['train_letter', 'train_empty_seat'].includes(enc.id) && options.length > 1
        ? options[random() < 0.5 ? 0 : 1] : null;
      const choice = variedNeutralChoice
        || options.find(c => c.result.setFlags?.some(f => /_route_happy$/.test(f)) && !c.result.setFlags?.some(f => /^romance_/.test(f)))
        || options.find(c => c.result.setFlags?.some(f => /^story_/.test(f)))
        || options[0];
      if (!choice) throw new Error(enc.id + ': 선택 가능한 행동이 없습니다.');
      let outcome = choice.result;
      if (choice.check && choice.fail && random() * 100 >= game.successChance(choice.check.stat, stats, choice.check)) {
        outcome = choice.fail;
      }
      for (const flag of [...(outcome.setFlags || []), ...(game.STORY_PROGRESS[enc.id] ? [game.STORY_PROGRESS[enc.id]] : [])]) {
        if (!flags.includes(flag)) flags.push(flag);
      }
      for (const flag of outcome.clearFlags || []) {
        const idx = flags.indexOf(flag);
        if (idx !== -1) flags.splice(idx, 1);
      }
      const bondStage = /(?:encounter_)?([12])$/.exec(enc.id)?.[1];
      if (enc.npcId && bondStage && outcome === choice.result && (outcome.affinity ?? 0) > 0) {
        const flag = `bond_${enc.npcId}_${bondStage}`;
        if (!flags.includes(flag)) flags.push(flag);
      }
      if (enc.once !== false && !seen.includes(enc.id)) seen.push(enc.id);
      if (outcome.setFlags?.some(f => /^route_\w+_(bad|normal|happy)$/.test(f))) aggregate.routeDecisions++;
      if (outcome.nextId) handle(outcome.nextId, depth + 1);
    };
    for (let act = 1; act <= 3; act++) for (let floor = 1; floor <= 8; floor++) {
      const nodes = game.generateChoices(`sim-${i}`, act, floor, 8);
      if (floor === 8) continue; // 보스는 강제 전투. 일반 노드와 구분한다.
      aggregate.totalFloorChoices++;
      if (nodes.some(node => node.type === 'event')) aggregate.eventOffered++;
      if (nodes.some(node => ['battle', 'elite'].includes(node.type))) aggregate.battleOffered++;
      const event = nodes.find(n => n.type === 'event');
      const battle = nodes.find(n => ['battle', 'elite'].includes(n.type));
      const selected = strategy === 'event-first' ? event || battle || nodes[0] : battle || event || nodes[0];
      if (selected.type === 'event') {
        aggregate.events++;
        const encounterId = game.pick(game.ENCOUNTERS, act, flags, seen, random);
        if (encounterId) handle(encounterId);
        else aggregate.noEventPool++;
      } else if (['battle','elite'].includes(selected.type)) aggregate.battles++;
      else aggregate.otherNodes++;
    }
    aggregate.perRunAmbient.push(ambient);
    aggregate.perRunNpc.push(npc);
  }
  const avg = a => (a.reduce((x,y)=>x+y,0) / n).toFixed(2);
  return {
    eventOfferedPercent: (100 * aggregate.eventOffered / aggregate.totalFloorChoices).toFixed(1),
    battleOfferedPercent: (100 * aggregate.battleOffered / aggregate.totalFloorChoices).toFixed(1),
    eventsPerRun: (aggregate.events / n).toFixed(2),
    optionalBattlesPerRun: (aggregate.battles / n).toFixed(2),
    otherPerRun: (aggregate.otherNodes / n).toFixed(2),
    ambientPerRun: avg(aggregate.perRunAmbient),
    npcScenesPerRun: avg(aggregate.perRunNpc),
    npcFirstPerRun: (aggregate.firstNpc / n).toFixed(2),
    npcNextPerRun: (aggregate.nextNpc / n).toFixed(2),
    specialRelationshipScenesPerRun: (aggregate.specialNpc / n).toFixed(2),
    routeConclusionsPerRun: (aggregate.routeDecisions / n).toFixed(2),
    distinctEventsSeen: aggregate.uniqueEncounterIds.size,
    neverSeenIds: game.ENCOUNTERS.filter(e => !aggregate.uniqueEncounterIds.has(e.id)).map(e => e.id),
    missingEncounters: aggregate.noEventPool,
  };
}

const cases = [{ label: 'P3 최신', root: path.resolve(__dirname, '..') }];
if (previous) cases.unshift({ label: '이전 버전', root: previous });
console.log(`\n=== ${runs}회 지도/랜덤 사건 선택 시뮬레이션 ===`);
console.log('※ HP 피해·죽음·레벨업을 무시한 출현 기회 모델입니다. 게임 클리어율과 동일하지 않습니다.');
console.log('※ 막 보스는 매 막 1회 강제 전투이며, 아래 선택형 전투 횟수에는 포함되지 않습니다.');
for (const item of cases) {
  const game = loadGame(item.root);
  console.log(`\n[${item.label}]`);
  for (const strategy of ['event-first', 'battle-first']) {
    console.log(strategy === 'event-first' ? '  사건 우선 선택:' : '  전투 우선 선택:');
    const res = simulate(game, runs, strategy);
    for (const [key, value] of Object.entries(res)) console.log(`    ${key}: ${value}`);
  }
}
