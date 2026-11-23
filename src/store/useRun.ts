import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MapNode, Stats, Status, LogEntry } from "../types/game";
import type { BattleState } from "../types/battle";
import type { NodeResult, ShopItem } from "../types/node";
import type { NpcId } from "../types/npc";
import { generateChoices } from "../lib/mapgen";
import { pickWeightedEncounter } from "../lib/encounterPool";
import { spawnEnemy } from "../data/enemies";
import { ENCOUNTERS } from "../data/encounters";
import { PROLOGUE_CHOICES, PROLOGUE_PAGES } from "../data/prologue";
import { successChance } from "../lib/check";
import { isChoiceAvailable } from "../lib/encounterChoice";
import { STORY_PROGRESS, migrateStoryProgress } from "../lib/storyProgress";
import { bondProtection } from "../lib/bond";
import type { EndingResult } from "../lib/ending";
import { audio } from "../lib/audio";
import { slotRef } from "./useSaveSlots";

const ACTS = 3;
const FLOORS_PER_ACT = 8;

const INITIAL_STATS: Stats = {
  wisdom: 4, insight: 4, will: 4, resonance: 4, body: 4, charm: 4,
};

const SHOP_POOL: ShopItem[] = [
  { id: "potion", name: "회복의 페이지", price: 20, effect: "heal", amount: 30 },
  { id: "mana", name: "명상의 잉크", price: 25, effect: "mana", amount: 20 },
  { id: "wisdom_up", name: "지혜의 각주", price: 60, effect: "stat", stat: "wisdom", amount: 1 },
  { id: "will_up", name: "의지의 장정", price: 60, effect: "stat", stat: "will", amount: 1 },
];

interface RunState {
  seed: string;
  act: number;
  floor: number;
  stats: Stats;
  hp: number; maxHp: number;
  mp: number; maxMp: number;
  gold: number; level: number; exp: number;
  statPoints: number;
  choices: MapNode[];
  current: MapNode | null;
  status: Status;
  nodeResult: NodeResult | null;
  battle: BattleState | null;
  shopItems: ShopItem[] | null;
  activeEncounter: string | null;
  encounterOutcome: { text: string; nextId?: string; effects?: string[] } | null;
  seenEncounters: string[];
  autoBattle: boolean;
  prologueStep: number;
  endingRecorded: boolean;
  endingResult: EndingResult | null;
  affinity: Record<NpcId, number>;
  flags: string[];
  logs: LogEntry[];

  startRun: (seed?: string) => void;
  advancePrologue: () => void;
  skipPrologue: () => void;
  choosePrologue: (choice: number) => void;
  markEndingRecorded: (ending: EndingResult) => void;
  selectNode: (node: MapNode) => void;
  advanceFloor: () => void;
  playerAttack: () => void;
  playerSkill: () => void;
  buyItem: (itemId: string) => void;
  closeShop: () => void;
  pickEncounter: (act: number) => string | null;
  resolveEncounterChoice: (i: number) => void;
  continueEncounter: () => void;
  toggleAutoBattle: () => void;
  distributeStat: (stat: keyof Stats) => void;
  closeLevelUp: () => void;
  addAffinity: (npc: NpcId, delta: number) => void;
  addFlag: (flag: string) => void;
  removeFlag: (flag: string) => void;
  hasFlag: (flag: string) => boolean;
  addLog: (text: string, type?: LogEntry["type"]) => void;
}

const slotStorage = createJSONStorage<any>(() => ({
  getItem: (name) => localStorage.getItem(`${name}_slot${slotRef.current}`),
  setItem: (name, value) => localStorage.setItem(`${name}_slot${slotRef.current}`, value),
  removeItem: (name) => localStorage.removeItem(`${name}_slot${slotRef.current}`),
}));

export const useRun = create<RunState>()(
  persist(
    (set, get) => ({
      seed: "", act: 1, floor: 1,
      stats: INITIAL_STATS,
      hp: 60, maxHp: 60, mp: 40, maxMp: 40,
      gold: 0, level: 1, exp: 0, statPoints: 0,
      choices: [], current: null, status: "choosing",
      nodeResult: null, battle: null, shopItems: null, activeEncounter: null, encounterOutcome: null, seenEncounters: [], autoBattle: false, prologueStep: 0, endingRecorded: false, endingResult: null,
      affinity: { rael: 0, seon: 0, kairu: 0 },
      flags: [], logs: [],

      startRun: (seed) => {
        const s = seed ?? Math.random().toString(36).slice(2, 10);
        set({
          seed: s, act: 1, floor: 1, stats: { ...INITIAL_STATS },
          hp: 60, maxHp: 60, mp: 40, maxMp: 40, gold: 0, level: 1, exp: 0, statPoints: 0,
          current: null, status: "prologue", prologueStep: 0, endingRecorded: false, endingResult: null,
          nodeResult: null, battle: null, shopItems: null, activeEncounter: null, encounterOutcome: null, seenEncounters: [],
          affinity: { rael: 0, seon: 0, kairu: 0 }, flags: [],
          logs: [{ id: 0, text: "빈 차표를 손에 쥐고 열차에 올랐다. 마지막 문장은 스스로 고르기로 했다.", type: "title" }],
          choices: generateChoices(s, 1, 1, FLOORS_PER_ACT),
        });
      },

      advancePrologue: () => set((s) => s.status === "prologue"
        ? { prologueStep: Math.min(PROLOGUE_PAGES.length, s.prologueStep + 1) }
        : s),
      skipPrologue: () => set((s) => s.status === "prologue" ? { prologueStep: PROLOGUE_PAGES.length } : s),
      choosePrologue: (index) => {
        const s = get();
        const choice = PROLOGUE_CHOICES[index];
        if (s.status !== "prologue" || s.prologueStep !== PROLOGUE_PAGES.length || !choice) return;
        set({
          status: "choosing",
          stats: { ...s.stats, [choice.stat]: s.stats[choice.stat] + 1 },
          flags: [...s.flags, choice.flag],
          logs: [...s.logs, { id: (s.logs.at(-1)?.id ?? -1) + 1, text: choice.log, type: "sys" }],
        });
      },
      markEndingRecorded: (ending) => set({ endingRecorded: true, endingResult: ending }),

      selectNode: (node) => {
        const s = get();
        set({ current: node });

        switch (node.type) {
          case "battle":
          case "elite":
          case "boss": {
            const enemy = spawnEnemy(s.level, s.seed, s.act, s.floor, node.type === "boss");
            set({
              status: "battle",
              battle: { enemy, turn: 1, log: [`책장 사이에서 ${enemy.name}이(가) 모습을 드러낸다. 숨을 고를 틈도 없이 객차의 공기가 달라진다.`] },
            });
            break;
          }
          case "shop":
            set({ status: "shop", shopItems: SHOP_POOL });
            break;
          case "rest": {
            const heal = Math.floor(s.maxHp * 0.3);
            const mana = Math.floor(s.maxMp * 0.3);
            audio.sfx("heal");
            set({
              status: "resolving",
              nodeResult: {
                logs: ["여백 위에서 잠시 숨을 고른다.", `체력 +${heal}, 내공 +${mana}`],
                reward: { hp: heal, mp: mana },
              },
            });
            break;
          }
          case "treasure": {
            const gold = 20 + Math.floor(Math.random() * 30);
            set({
              status: "resolving",
              nodeResult: {
                logs: ["봉인된 책장을 열었다.", `골드 +${gold}`],
                reward: { gold },
              },
            });
            break;
          }
          case "event": {
            const encId = s.pickEncounter(s.act);
            if (encId) {
              audio.sfx("event");
              set({ status: "rel", activeEncounter: encId });
              return;
            }
            const gold = 10 + Math.floor(Math.random() * 20);
            set({
              status: "resolving",
              nodeResult: {
                logs: ["낯선 삽화 속에서 무언가가 속삭인다. 더는 말을 걸지 않는다.", `골드 +${gold}`],
                reward: { gold },
              },
            });
            break;
          }
        }
      },

      advanceFloor: () => {
        const { act, floor, seed, nodeResult } = get();

        if (nodeResult?.logs.length) {
          get().addLog(nodeResult.logs[nodeResult.logs.length - 1]);
        }

        if (nodeResult?.endsRun === "death" || nodeResult?.endsRun === "victory") {
          set({ status: "ended", current: null, choices: [] });
          return;
        }

        if (nodeResult?.reward) {
          const r = nodeResult.reward;
          set((s) => ({
            gold: s.gold + (r.gold ?? 0),
            hp: Math.min(s.maxHp, s.hp + (r.hp ?? 0)),
            mp: Math.min(s.maxMp, s.mp + (r.mp ?? 0)),
            exp: s.exp + (r.exp ?? 0),
          }));
        }

        let nextAct = act, nextFloor = floor + 1;
        if (nextFloor > FLOORS_PER_ACT) { nextAct += 1; nextFloor = 1; }

        if (nextAct > ACTS) {
          set({ status: "ended", nodeResult: { logs: [], endsRun: "victory" }, current: null, choices: [] });
          return;
        }

        set({
          act: nextAct, floor: nextFloor,
          current: null, nodeResult: null,
          battle: null, shopItems: null, activeEncounter: null,
          status: "choosing",
          choices: generateChoices(seed, nextAct, nextFloor, FLOORS_PER_ACT),
        });
      },

      playerAttack: () => {
        const { battle, stats } = get();
        if (!battle) return;
        audio.sfx("attack");
        const dmg = Math.max(1, Math.floor(stats.body * 1.8 + Math.random() * 5) - 2);
        const enemyHp = battle.enemy.hp - dmg;
        const logs = [...battle.log, `당신이 몸을 낮추고 앞으로 나아간다. ${battle.enemy.name}의 형체가 흔들린다.`];

        if (enemyHp <= 0) return winBattle(get, set, logs);

        const incoming = Math.max(
          1,
          battle.enemy.atk - Math.floor(stats.will * 0.3) - bondProtection(get().affinity) + Math.floor(Math.random() * 4) - 2,
        );
        const hp = get().hp - incoming;
        audio.sfx("hit");
        logs.push("종이가 찢기는 소리와 함께 반격이 밀려온다. 당신은 이를 악물고 자리를 지킨다.");

        if (hp <= 0) {
          set({
            battle: null, status: "resolving",
            nodeResult: { logs: [...logs, "…페이지가 찢어진다. 의식이 흐려진다."], endsRun: "death" },
          });
          return;
        }
        set({ hp, battle: { ...battle, enemy: { ...battle.enemy, hp: enemyHp }, turn: battle.turn + 1, log: logs } });
      },

      playerSkill: () => {
        const { battle, stats, mp } = get();
        if (!battle) return;
        if (mp < 10) return get().addLog("내공이 부족하다.", "sys");
        audio.sfx("attack");
        const dmg = Math.floor(stats.resonance * 2.5) + 10;
        const enemyHp = battle.enemy.hp - dmg;
        const logs = [...battle.log, "손끝에 모인 감응이 가느다란 빛으로 번진다. 빛이 어둠의 틈을 가른다."];
        set({ mp: mp - 10 });
        if (enemyHp <= 0) return winBattle(get, set, logs);

        const incoming = Math.max(1, battle.enemy.atk - Math.floor(stats.will * 0.3) - bondProtection(get().affinity));
        const hp = get().hp - incoming;
        audio.sfx("hit");
        logs.push("흩어진 그림자가 다시 몸을 세운다. 차가운 기운이 곁을 스친다.");
        if (hp <= 0) {
          set({ battle: null, status: "resolving", nodeResult: { logs: [...logs, "…페이지가 찢어진다."], endsRun: "death" } });
          return;
        }
        set({ hp, battle: { ...battle, enemy: { ...battle.enemy, hp: enemyHp }, turn: battle.turn + 1, log: logs } });
      },

      buyItem: (itemId) => {
        const { shopItems, gold, stats } = get();
        const item = shopItems?.find((x) => x.id === itemId);
        if (!item) return;
        if (gold < item.price) return get().addLog("골드가 부족하다.", "sys");
        set({ gold: gold - item.price });
        if (item.effect === "heal") set((s) => ({ hp: Math.min(s.maxHp, s.hp + item.amount) }));
        if (item.effect === "mana") set((s) => ({ mp: Math.min(s.maxMp, s.mp + item.amount) }));
        if (item.effect === "stat" && item.stat)
          set({ stats: { ...stats, [item.stat]: stats[item.stat] + item.amount } });
        get().addLog(`${item.name} 구매.`, "loot");
      },

      closeShop: () => set({
        shopItems: null, status: "resolving",
        nodeResult: { logs: ["상점을 뒤로하고 길을 나선다."] },
      }),

      pickEncounter: (act) => {
        const { flags, seenEncounters } = get();
        return pickWeightedEncounter(ENCOUNTERS, act, flags, seenEncounters);
      },

      resolveEncounterChoice: (i) => {
        const s = get();
        if (!s.activeEncounter || s.encounterOutcome) return;
        const enc = ENCOUNTERS.find((e) => e.id === s.activeEncounter);
        const choice = enc?.choices[i];
        if (!enc || !choice) return;
        if (!isChoiceAvailable(choice, s.flags, s.stats)) return;

        let outcome = choice.result;
        if (choice.check) {
          const threshold = successChance(choice.check.stat, s.stats, choice.check);
          const roll = Math.floor(Math.random() * 100) + 1;
          if (roll > threshold && choice.fail) outcome = choice.fail;
        }

        const effects: string[] = [];
        if (outcome.affinity && enc.npcId) {
          const before = s.affinity[enc.npcId];
          const after = Math.max(0, Math.min(100, before + outcome.affinity));
          const change = after - before;
          if (change) effects.push(`${enc.npcId === "rael" ? "라엘" : enc.npcId === "seon" ? "세온" : "카이루"} 관계 ${change > 0 ? "+" : ""}${change}`);
          s.addAffinity(enc.npcId, outcome.affinity);
        }
        // Event rewards are settled immediately: the result screen has no separate
        // nodeResult, so advanceFloor must never apply the same reward again.
        if (outcome.reward) {
          const reward = outcome.reward;
          const afterGold = Math.max(0, s.gold + (reward.gold ?? 0));
          const afterHp = Math.max(1, Math.min(s.maxHp, s.hp + (reward.hp ?? 0)));
          const afterMp = Math.max(0, Math.min(s.maxMp, s.mp + (reward.mp ?? 0)));
          for (const [name, change] of [
            ["골드", afterGold - s.gold], ["체력", afterHp - s.hp], ["내공", afterMp - s.mp],
          ] as const) {
            if (change !== 0) effects.push(`${name} ${change > 0 ? "+" : ""}${change}`);
          }
          set({ gold: afterGold, hp: afterHp, mp: afterMp });
        }
        outcome.setFlags?.forEach((f) => s.addFlag(f));
        outcome.clearFlags?.forEach((f) => s.removeFlag(f));
        // Every meeting can reveal a story clue, even after a refusal or failed check.
        const storyFlag = STORY_PROGRESS[enc.id];
        if (storyFlag) s.addFlag(storyFlag);
        const stage = /(?:encounter_)?([12])$/.exec(enc.id)?.[1];
        if (enc.npcId && stage && outcome === choice.result && (outcome.affinity ?? 0) > 0) {
          s.addFlag(`bond_${enc.npcId}_${stage}`);
        }
        // A one-time encounter is consumed even on a failed check or refusal.
        // Otherwise failures re-enter the random pool and can repeat forever.
        if (enc.once !== false && !get().seenEncounters.includes(enc.id)) {
          set((st) => ({ seenEncounters: [...st.seenEncounters, enc.id] }));
        }

        const effectText = effects.length ? `\n${effects.join(" · ")}` : "";
        s.addLog(`【${enc.title}】\n${choice.text}\n\n${outcome.text}${effectText}`, "sys");
        set({ encounterOutcome: { text: outcome.text, nextId: outcome.nextId, effects } });
      },

      continueEncounter: () => {
        const outcome = get().encounterOutcome;
        if (!outcome) return;
        set({ encounterOutcome: null, activeEncounter: outcome.nextId ?? null });
        if (!outcome.nextId) get().advanceFloor();
      },

      toggleAutoBattle: () => set((s) => ({ autoBattle: !s.autoBattle })),

      distributeStat: (stat) => {
        const s = get();
        if (s.statPoints <= 0) return;
        set({
          stats: { ...s.stats, [stat]: s.stats[stat] + 1 },
          statPoints: s.statPoints - 1,
        });
      },

      closeLevelUp: () => {
        if (get().statPoints > 0) return;
        set({ status: "resolving" });
      },

      addAffinity: (npc, d) => set((s) => ({
        affinity: { ...s.affinity, [npc]: Math.max(0, Math.min(100, s.affinity[npc] + d)) },
      })),
      addFlag: (f) => set((s) => s.flags.includes(f) ? s : { ...s, flags: [...s.flags, f] }),
      removeFlag: (f) => set((s) => ({ flags: s.flags.filter((flag) => flag !== f) })),
      hasFlag: (f) => get().flags.includes(f),
      addLog: (text, type = "sys") =>
        set((s) => ({ logs: [...s.logs, { id: (s.logs.at(-1)?.id ?? -1) + 1, text, type }] })),
    }),
    {
      name: "endless-archive-run",
      version: 7,
      storage: slotStorage,
      migrate: (persisted: any, version) => {
        const s = persisted;
        if (version < 2) {
          s.statPoints = s.statPoints ?? 0;
          s.status = s.status ?? "choosing";
          s.logs = s.logs ?? [];
          s.affinity = s.affinity ?? { rael: 0, seon: 0, kairu: 0 };
          s.flags = s.flags ?? [];
        }
        if (version < 3) {
          const mapId = (id: string) => {
            const raelStage = /^rael_([123])$/.exec(id);
            if (raelStage) return `rael_encounter_${raelStage[1]}`;
            if (id === "rael_final_choice") return "rael_final";
            return id;
          };
          s.activeEncounter = s.activeRelEvent ? mapId(s.activeRelEvent) : null;
          s.seenEncounters = (s.flags ?? [])
            .filter((flag: string) => flag.startsWith("seen_"))
            .map((flag: string) => mapId(flag.slice(5)));
          delete s.activeRelEvent;
        }
        if (version < 4) {
          const aliases: Record<string, string[]> = {
            bond_rael_1: ["rael_first_smile"], bond_rael_2: ["rael_saw_scar", "rael_noticed_scar"],
            bond_seon_1: ["seon_shared_name"], bond_seon_2: ["seon_world_name"],
            bond_kairu_1: ["kairu_heard_voice"], bond_kairu_2: ["kairu_true_name"],
          };
          for (const [bond, oldFlags] of Object.entries(aliases)) {
            if (oldFlags.some((flag) => s.flags?.includes(flag)) && !s.flags.includes(bond)) s.flags.push(bond);
          }
          const stages: Record<string, string> = {
            rael_encounter_1: "bond_rael_1", rael_encounter_2: "bond_rael_2",
            seon_1: "bond_seon_1", seon_2: "bond_seon_2",
            kairu_1: "bond_kairu_1", kairu_2: "bond_kairu_2",
          };
          s.seenEncounters = (s.seenEncounters ?? []).filter((id: string) => !stages[id] || s.flags.includes(stages[id]));
        }
        if (version < 5) {
          s.prologueStep = 0;
          s.endingRecorded = s.status === "ended";
        }
        if (version < 6) s.endingResult = null;
        if (version < 7) {
          // Existing story progress counts even if an older run only stored bond flags.
          // Old *_end_confirmed flags are deliberately NOT upgraded to a new BAD/NORMAL/HAPPY:
          // the old data does not reveal which outcome the player actually chose.
          s.flags = migrateStoryProgress(
            Array.isArray(s.flags) ? s.flags : [],
            Array.isArray(s.seenEncounters) ? s.seenEncounters : [],
          );
        }
        return s;
      },
      partialize: (s) => ({
        seed: s.seed, act: s.act, floor: s.floor, stats: s.stats,
        hp: s.hp, maxHp: s.maxHp, mp: s.mp, maxMp: s.maxMp,
        gold: s.gold, level: s.level, exp: s.exp, statPoints: s.statPoints,
        choices: s.choices, current: s.current, status: s.status,
        nodeResult: s.nodeResult, battle: s.battle, shopItems: s.shopItems,
        activeEncounter: s.activeEncounter, encounterOutcome: s.encounterOutcome, seenEncounters: s.seenEncounters, autoBattle: s.autoBattle, prologueStep: s.prologueStep, endingRecorded: s.endingRecorded, endingResult: s.endingResult, affinity: s.affinity,
        flags: s.flags, logs: s.logs,
      }),
    },
  ),
);

export const useRunHydrated = () =>
  useSyncExternalStore(
    (onStoreChange) => useRun.persist.onFinishHydration(onStoreChange),
    () => useRun.persist.hasHydrated(),
    () => false,
  );

type Get = () => RunState;
type Set = (p: Partial<RunState>) => void;

function winBattle(get: Get, set: Set, logs: string[]) {
  const { battle, exp, level, gold, maxHp, maxMp } = get();
  if (!battle) return;
  const e = battle.enemy;
  logs.push(`${e.name}을(를) 쓰러뜨렸다! +${e.exp}EXP +${e.gold}G`);

  let newLevel = level;
  let remaining = exp + e.exp;
  while (remaining >= newLevel * 30) {
    remaining -= newLevel * 30;
    newLevel++;
  }
  const gained = newLevel - level;
  const bonusHp = gained * 5;
  const bonusMp = gained * 5;

  if (gained > 0) audio.sfx("levelup");

  const isVictory = battle.enemy.name.includes("마지막 장");

  set({
    battle: null,
    hp: Math.min(maxHp + bonusHp, get().hp + Math.floor(maxHp * 0.2)),
    mp: Math.min(maxMp + bonusMp, get().mp + Math.floor(maxMp * 0.2)),
    gold: gold + e.gold,
    exp: remaining,
    level: newLevel,
    maxHp: maxHp + bonusHp,
    maxMp: maxMp + bonusMp,
    statPoints: get().statPoints + gained * 3,
    nodeResult: {
      logs,
      endsRun: isVictory ? "victory" : undefined,
    },
    status: gained > 0 ? "levelup" : "resolving",
  });
}
