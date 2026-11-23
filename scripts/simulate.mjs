// 사용: npm run sim 또는 node scripts/simulate.mjs 1000
// 실제 게임 상태와 인카운트 데이터를 사용해 한 가지 자동 선택 전략을 실행한다.
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const runs = Number(process.argv[2] ?? 1000);
if (!Number.isSafeInteger(runs) || runs < 1) {
  console.error("시뮬레이션 횟수는 1 이상의 정수여야 합니다.");
  process.exit(1);
}

// Vite의 의존성인 esbuild로 앱의 TypeScript를 메모리에서 불러온다.
const require = createRequire(import.meta.url);
const viteRequire = createRequire(require.resolve("vite/package.json"));
const { build } = viteRequire("esbuild");
const root = fileURLToPath(new URL("../", import.meta.url));
const { outputFiles } = await build({
  stdin: {
    contents: [
      'export { useRun } from "./src/store/useRun.ts";',
      'export { ENCOUNTERS } from "./src/data/encounters.ts";',
      'export { resolveEnding } from "./src/lib/ending.ts";',
      'export { audio } from "./src/lib/audio.ts";',
    ].join("\n"),
    resolveDir: root,
    sourcefile: "simulate-entry.ts",
    loader: "ts",
  },
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node18",
  write: false,
  logLevel: "silent",
});

// 브라우저 저장소와 소리는 시뮬레이션에 필요하지 않다.
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};
const moduleUrl = "data:text/javascript;base64," + Buffer.from(outputFiles[0].contents).toString("base64");
const { useRun, ENCOUNTERS, resolveEnding, audio } = await import(moduleUrl);
audio.sfx = () => {};

const results = [];
for (let index = 0; index < runs; index++) {
  useRun.getState().startRun(`sim-${index}`);
  useRun.getState().skipPrologue();
  useRun.getState().choosePrologue(0);

  let actions = 0;
  while (useRun.getState().status !== "ended" && actions++ < 1500) {
    const state = useRun.getState();
    switch (state.status) {
      case "choosing": {
        const find = (type) => state.choices.find((node) => node.type === type);
        const node =
          (state.hp < state.maxHp * 0.6 && find("rest")) ||
          (state.gold >= 25 && state.mp < state.maxMp - 15 && find("shop")) ||
          find("event") ||
          (state.hp < state.maxHp * 0.85 && find("rest")) ||
          find("battle") || find("elite") || state.choices[0];
        if (!node) throw new Error("선택할 수 있는 페이지가 없습니다.");
        state.selectNode(node);
        break;
      }
      case "rel": {
        if (state.encounterOutcome) {
          state.continueEncounter();
          break;
        }
        const encounter = ENCOUNTERS.find((item) => item.id === state.activeEncounter);
        if (!encounter) throw new Error(`인카운트를 찾지 못했습니다: ${state.activeEncounter}`);
        const choice = encounter.choices.findIndex((item) =>
          (item.result.affinity ?? 0) > 0 && !item.check &&
          (!item.require?.flag || state.flags.includes(item.require.flag)) &&
          (!item.require?.stat || item.require.min === undefined || state.stats[item.require.stat] >= item.require.min)
        );
        state.resolveEncounterChoice(choice < 0 ? 0 : choice);
        break;
      }
      case "battle":
        if (state.mp >= 10) state.playerSkill();
        else state.playerAttack();
        break;
      case "shop":
        if (state.gold >= 25 && state.mp < state.maxMp - 10) state.buyItem("mana");
        else if (state.gold >= 20 && state.hp < state.maxHp - 15) state.buyItem("potion");
        else state.closeShop();
        break;
      case "levelup":
        if (state.statPoints > 0) state.distributeStat("resonance");
        else state.closeLevelUp();
        break;
      case "resolving":
        state.advanceFloor();
        break;
      default:
        throw new Error(`예상하지 못한 상태: ${state.status}`);
    }
  }

  const state = useRun.getState();
  if (state.status !== "ended") throw new Error("여정을 끝내지 못했습니다.");
  const victory = state.nodeResult?.endsRun === "victory";
  const ending = resolveEnding(state.affinity, state.flags, victory, []);
  results.push({ victory, act: state.act, ending: ending.id });
}

const victories = results.filter((result) => result.victory).length;
const endingNames = {
  death: "찢어진 페이지",
  solo: "서고의 주인",
  rael_end: "라엘",
  seon_end: "세온",
  kairu_end: "카이루",
  true_end: "진실",
};

console.log(`\n=== 실제 게임 로직 시뮬레이션 ${runs}회 ===`);
console.log("전략: 만남 우선 · 필요한 경우 회복 · 자동 전투 · 감응 투자");
console.log(`클리어: ${victories}회 (${(victories / runs * 100).toFixed(1)}%)`);
console.log("\n[사망한 막]");
for (const act of [1, 2, 3]) {
  const count = results.filter((result) => !result.victory && result.act === act).length;
  console.log(`  ${act}막: ${count}회 (${(count / runs * 100).toFixed(1)}%)`);
}
console.log("\n[도달한 결말]");
for (const [id, name] of Object.entries(endingNames)) {
  const count = results.filter((result) => result.ending === id).length;
  if (count) console.log(`  ${name}: ${count}회`);
}
console.log("\n진실 엔딩은 이전 여정 기록이 필요하므로 이 시뮬레이션에서는 계산하지 않습니다.");

