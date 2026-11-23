import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { STAT_LABEL } from "../types/game";
import type { MapNode, Stats, Status, LogEntry, StatKey } from "../types/game";
import type { BattleState } from "../types/battle";
import type { CharmEffect, CharmItem, NodeResult, ShopCharmOffer, ShopItem, WeaponItem } from "../types/node";
import type { NpcId } from "../types/npc";
import { generateChoices } from "../lib/mapgen";
import { pickWeightedEncounter } from "../lib/encounterPool";
import { spawnEnemy } from "../data/enemies";
import { ENCOUNTERS } from "../data/encounters";
import { getEncounterArt, getShopArt } from "../data/artLibrary";
import { useMeta } from "./useMeta";
import { PROLOGUE_CHOICES, PROLOGUE_PAGES } from "../data/prologue";
import { rollBattleOpening, successChance } from "../lib/check";
import { formatCharmEffects, formatStatBonuses } from "../lib/equipment";
import { isChoiceAvailable } from "../lib/encounterChoice";
import { STORY_PROGRESS, migrateStoryProgress } from "../lib/storyProgress";
import { bondProtection } from "../lib/bond";
import { isLastBossTelegraph } from "../lib/battlePattern";
import type { EndingResult } from "../lib/ending";
import { audio } from "../lib/audio";
import { slotRef } from "./useSaveSlots";
import { STORY_BOOKS } from "../data/stories";
import { interludeFor } from "../data/interludes";
import { UNNAMED_STATION_OPENING, unnamedStationInterludeFor } from "../data/unnamedStation";
import type { FinalDestination } from "../lib/ending";

const ACTS = 3;
const FLOORS_PER_ACT = 8;

const INITIAL_STATS: Stats = {
  wisdom: 4, insight: 4, will: 4, resonance: 4, body: 4, charm: 4,
};

const SHOP_POOL: ShopItem[] = [
  { id: "potion", name: "체력 물약", price: 12, effect: "heal", amount: 1 },
  { id: "focus_potion", name: "집중력 물약", price: 12, effect: "mana", amount: 1 },
  { id: "worn_quill", name: "낡은 철필", price: 12, effect: "weapon", amount: 1, statBonus: { insight: 1 }, minAct: 1 },
  { id: "bound_blade", name: "강철 제본검", price: 38, effect: "weapon", amount: 2, statBonus: { will: 1 }, minAct: 2 },
  { id: "rail_cutter", name: "운행 절단검", price: 68, effect: "weapon", amount: 3, statBonus: { body: 1 }, minAct: 3 },
  { id: "binding_coat", name: "두꺼운 제본 외투", price: 42, effect: "armor", amount: 1 },
  { id: "lucky_die", name: "행운의 주사위", price: 30, effect: "luck", amount: 1 },
  { id: "wisdom_up", name: "지혜의 각주", price: 60, effect: "stat", stat: "wisdom", amount: 1 },
  { id: "will_up", name: "의지의 장정", price: 60, effect: "stat", stat: "will", amount: 1 },
];

const SPIRIT_SHOP_POOL: ShopItem[] = [
  { id: "spirit_water", name: "새벽 이슬 물약", price: 15, effect: "heal", amount: 1 },
  { id: "spirit_focus", name: "푸른 잉크 물약", price: 15, effect: "mana", amount: 1 },
  { id: "spirit_quill_1", name: "역의 파편", price: 15, effect: "weapon", amount: 1, statBonus: { resonance: 1 }, minAct: 1 },
  { id: "spirit_quill_2", name: "유리 궤도검", price: 45, effect: "weapon", amount: 2, statBonus: { wisdom: 1 }, minAct: 2 },
  { id: "spirit_quill_3", name: "새벽의 단도", price: 75, effect: "weapon", amount: 3, statBonus: { insight: 1 }, minAct: 3 },
  { id: "spirit_ward", name: "역무원의 부적", price: 45, effect: "armor", amount: 1 },
  { id: "spirit_die", name: "길잡이의 주사위", price: 35, effect: "luck", amount: 1 },
];

const CHARM_POOL: CharmItem[] = [
  { id: "pressed_ticket", name: "찢긴 차표", price: 28, value: 14, effects: [{ kind: "stat", stat: "body", amount: 1 }, { kind: "maxHp", amount: 8 }] },
  { id: "blue_ink_drop", name: "푸른 잉크 방울", price: 30, value: 15, effects: [{ kind: "stat", stat: "resonance", amount: 1 }, { kind: "maxMp", amount: 8 }] },
  { id: "conductor_seal", name: "차장의 인장", price: 38, value: 19, effects: [{ kind: "stat", stat: "will", amount: 1 }, { kind: "maxHp", amount: 5 }] },
  { id: "glass_bookmark", name: "유리 책갈피", price: 34, value: 17, effects: [{ kind: "stat", stat: "insight", amount: 1 }, { kind: "stat", stat: "wisdom", amount: 1 }] },
  { id: "moon_bell", name: "달의 방울", price: 40, value: 20, effects: [{ kind: "stat", stat: "charm", amount: 1 }, { kind: "maxMp", amount: 6 }] },
  { id: "iron_clasp", name: "철제 매듭", price: 42, value: 21, effects: [{ kind: "stat", stat: "body", amount: 1 }, { kind: "stat", stat: "will", amount: 1 }] },
  { id: "wind_knot", name: "바람의 매듭", price: 36, value: 18, effects: [{ kind: "luck", amount: 1 }, { kind: "stat", stat: "insight", amount: 1 }] },
  { id: "station_silver", name: "역의 은표", price: 45, value: 22, effects: [{ kind: "stat", stat: "wisdom", amount: 1 }, { kind: "maxHp", amount: 6 }] },
];

type Shopkeeper = "merchant" | "spirit";
const MAX_ARMOR_POWER = 3;
const MAX_CONSUMABLES = 5;
const MAX_WEAPON_INVENTORY = 8;

function weaponModifierKey(power: number, bonus?: Partial<Stats>) {
  const secondary = Object.entries(bonus ?? {}).filter(([, amount]) => amount).sort(([a], [b]) => a.localeCompare(b));
  return `${power}:${secondary.map(([stat, amount]) => `${stat}=${amount}`).join(",")}`;
}

function buildShopStock(pool: ShopItem[], act: number, luck: number, armorPower: number, ownedWeapons: WeaponItem[]): ShopItem[] {
  const available = pool.filter((item) =>
    (!item.minAct || act >= item.minAct)
    && !(item.effect === "luck" && luck >= 1)
    && !(item.effect === "armor" && armorPower >= MAX_ARMOR_POWER),
  ).filter((item) => item.effect !== "weapon" || !ownedWeapons.some((weapon) =>
    weaponModifierKey(weapon.power, weapon.statBonus) === weaponModifierKey(item.amount, item.statBonus),
  ));
  const weapon = available.filter((item) => item.effect === "weapon").sort((a, b) => b.amount - a.amount)[0];
  const core = [
    available.find((item) => item.effect === "heal"),
    available.find((item) => item.effect === "mana"),
    weapon,
    available.find((item) => item.effect === "armor"),
  ].filter((item): item is ShopItem => Boolean(item));
  const coreIds = new Set(core.map((item) => item.id));
  const extras = available.filter((item) => !coreIds.has(item.id) && item.effect !== "weapon");
  while (extras.length > 2) extras.splice(Math.floor(Math.random() * extras.length), 1);
  return [...core, ...extras].map((item) => ({ ...item, stock: 1 }));
}

function buildCharmStock(ownedIds: string[]): ShopCharmOffer[] {
  const available = CHARM_POOL.filter((charm) => !ownedIds.includes(charm.id));
  if (!available.length || Math.random() >= 0.55) return [];

  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }
  const count = Math.random() < 0.2 ? 2 : 1;
  return available.slice(0, count).map((charm) => ({ ...charm, stock: 1 }));
}

function formatWeaponStatBonus(bonus?: Partial<Stats>) {
  const formatted = formatStatBonuses(bonus);
  return formatted.length ? ` · ${formatted.join(" · ")}` : "";
}

function formatCharmEffectSummary(effects: CharmEffect[]) {
  return formatCharmEffects(effects).join(" · ");
}

function rememberSeenArt(encounters: unknown, flags: unknown) {
  if (!Array.isArray(encounters)) return;
  const runFlags = Array.isArray(flags) ? flags.filter((flag): flag is string => typeof flag === "string") : [];
  for (const id of encounters) {
    if (typeof id !== "string") continue;
    for (const art of [getEncounterArt(id), getEncounterArt(id, runFlags, true)]) {
      if (art) useMeta.getState().collectPage(`art:${art.id}`);
    }
  }
}

interface RunState {
  seed: string;
  storyId: string;
  act: number;
  floor: number;
  stats: Stats;
  hp: number; maxHp: number;
  mp: number; maxMp: number;
  weaponPower: number; armorPower: number; luck: number;
  healthPotions: number; focusPotions: number;
  ownedWeapons: WeaponItem[]; equippedWeaponId: string | null;
  ownedCharms: CharmItem[]; equippedCharmId: string | null;
  gold: number; level: number; exp: number;
  statPoints: number;
  choices: MapNode[];
  current: MapNode | null;
  status: Status;
  nodeResult: NodeResult | null;
  battle: BattleState | null;
  shopItems: ShopItem[] | null;
  shopCharms: ShopCharmOffer[] | null;
  shopkeeper: Shopkeeper | null;
  pendingWeaponPrompt: { weaponId: string; source: "purchase" | "loot" } | null;
  activeEncounter: string | null;
  encounterOutcome: { text: string; nextId?: string; effects?: string[]; battle?: { name: string } } | null;
  seenEncounters: string[];
  autoBattle: boolean;
  prologueStep: number;
  interludeAct: number | null;
  finalDestination: FinalDestination | null;
  endingRecorded: boolean;
  endingResult: EndingResult | null;
  affinity: Record<NpcId, number>;
  flags: string[];
  logs: LogEntry[];

  startRun: (seed?: string) => void;
  advancePrologue: () => void;
  skipPrologue: () => void;
  choosePrologue: (choice: number) => void;
  selectStory: (storyId: string) => void;
  chooseStoryOpening: (choice: number) => void;
  chooseInterlude: (choice: number) => void;
  chooseFinalDestination: (destination: FinalDestination) => void;
  markEndingRecorded: (ending: EndingResult) => void;
  selectNode: (node: MapNode) => void;
  advanceFloor: () => void;
  playerAttack: () => void;
  playerSkill: () => void;
  playerBrace: () => void;
  buyItem: (itemId: string) => void;
  buyCharm: (charmId: string) => void;
  equipWeapon: (weaponId: string) => void;
  equipCharm: (charmId: string) => void;
  dismissWeaponPrompt: () => void;
  sellWeapon: (weaponId: string) => void;
  closeShop: () => void;
  useHealingPotion: () => void;
  useFocusPotion: () => void;
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
      seed: "", storyId: "", act: 1, floor: 1,
      stats: INITIAL_STATS,
      hp: 60, maxHp: 60, mp: 40, maxMp: 40, weaponPower: 0, armorPower: 0, luck: 0,
      healthPotions: 1, focusPotions: 1, ownedWeapons: [], equippedWeaponId: null,
      ownedCharms: [], equippedCharmId: null,
      gold: 0, level: 1, exp: 0, statPoints: 0,
      choices: [], current: null, status: "choosing",
      nodeResult: null, battle: null, shopItems: null, shopCharms: null, shopkeeper: null, pendingWeaponPrompt: null, activeEncounter: null, encounterOutcome: null, seenEncounters: [], autoBattle: false, prologueStep: 0, interludeAct: null, finalDestination: null, endingRecorded: false, endingResult: null,
      affinity: { rael: 0, seon: 0, kairu: 0 },
      flags: [], logs: [],

      startRun: (seed) => {
        const s = seed ?? Math.random().toString(36).slice(2, 10);
        set({
          seed: s, storyId: "", act: 1, floor: 1, stats: { ...INITIAL_STATS },
          hp: 60, maxHp: 60, mp: 40, maxMp: 40, weaponPower: 0, armorPower: 0, luck: 0,
          healthPotions: 1, focusPotions: 1, ownedWeapons: [], equippedWeaponId: null,
          ownedCharms: [], equippedCharmId: null,
          gold: 0, level: 1, exp: 0, statPoints: 0,
          current: null, status: "prologue", prologueStep: 0, interludeAct: null, finalDestination: null, endingRecorded: false, endingResult: null,
          nodeResult: null, battle: null, shopItems: null, shopCharms: null, shopkeeper: null, pendingWeaponPrompt: null, activeEncounter: null, encounterOutcome: null, seenEncounters: [],
          affinity: { rael: 0, seon: 0, kairu: 0 }, flags: [],
          logs: [
            { id: 0, text: "빈 차표를 손에 쥐고 열차에 올랐다. 마지막 문장은 스스로 고르기로 했다.", type: "title" },
            { id: 1, text: "비상용 체력 물약과 집중력 물약을 하나씩 챙겼다.", type: "loot" },
          ],
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
          status: "storySelect",
          stats: choice.stat ? { ...s.stats, [choice.stat]: s.stats[choice.stat] + (choice.amount ?? 0) } : s.stats,
          gold: s.gold + (choice.gold ?? 0),
          flags: [...s.flags, choice.flag],
          logs: [...s.logs, { id: (s.logs.at(-1)?.id ?? -1) + 1, text: choice.log, type: "sys" }],
        });
      },
      selectStory: (storyId) => {
        const s = get();
        const story = STORY_BOOKS.find((book) => book.id === storyId);
        if (s.status !== "storySelect" || !story) return;
        set({
          storyId: story.id,
          status: "storyOpening",
          choices: [],
          logs: [...s.logs, { id: (s.logs.at(-1)?.id ?? -1) + 1, text: `【${story.title}】\n${story.description}`, type: "title" }],
        });
      },
      chooseStoryOpening: (index) => {
        const s = get();
        if (s.status !== "storyOpening" || s.storyId !== "unnamed_station") return;
        const choice = UNNAMED_STATION_OPENING.choices[index];
        if (!choice) return;
        set({
          status: "choosing",
          choices: generateChoices(s.seed, 1, 1, FLOORS_PER_ACT),
          flags: [...s.flags, choice.flag],
          logs: [...s.logs, { id: (s.logs.at(-1)?.id ?? -1) + 1, text: choice.log, type: "sys" }],
        });
      },
      chooseInterlude: (index) => {
        const s = get();
        if (s.status !== "interlude" || s.interludeAct === null) return;
        const beat = s.storyId === "unnamed_station"
          ? unnamedStationInterludeFor(s.interludeAct, s.flags)
          : interludeFor(s.interludeAct, s.flags);
        const choice = beat.choices[index];
        if (!choice) return;
        set({
          status: "choosing",
          floor: 1,
          interludeAct: null,
          current: null,
          nodeResult: null,
          choices: generateChoices(s.seed, s.act, 1, FLOORS_PER_ACT),
          flags: [...s.flags, choice.flag],
          logs: [...s.logs, { id: (s.logs.at(-1)?.id ?? -1) + 1, text: choice.log, type: "sys" }],
        });
      },
      chooseFinalDestination: (destination) => {
        const s = get();
        if (s.status !== "finalChoice") return;
        const flag = `ending_${destination}`;
        set({
          status: "ended",
          finalDestination: destination,
          flags: s.flags.includes(flag) ? s.flags : [...s.flags, flag],
          current: null,
          choices: [],
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
            const difficulty = node.type === "boss" ? 14 + (s.act - 1) * 2 : node.type === "elite" ? 13 : 10;
            const openingRoll = rollBattleOpening(s.stats.body, s.luck, difficulty);
            const rollLabel = openingRoll.outcome === "great" ? "크리티컬!" : openingRoll.outcome === "success" ? "성공!" : openingRoll.outcome === "fumble" ? "대실패!" : "실패!";
            set({
              status: "battle",
              battle: { enemy, turn: 1, log: [`책장 사이에서 ${enemy.name}이(가) 모습을 드러낸다. 숨을 고를 틈도 없이 객차의 공기가 달라진다.`] },
            });
            const battle = get().battle;
            if (battle) set({ battle: {
              ...battle,
              openingRoll,
              log: [...battle.log, `전투 전 판정 ${rollLabel} · d20 ${openingRoll.rolled} + 힘·행운 ${openingRoll.modifier} = ${openingRoll.total} / ${difficulty}${openingRoll.powerBonus ? ` · 공격력 +${openingRoll.powerBonus}` : ""}`],
            } });
            break;
          }
          case "shop": {
            const shopkeeper: Shopkeeper = Math.random() < 0.28 ? "spirit" : "merchant";
            const pool = shopkeeper === "spirit" ? SPIRIT_SHOP_POOL : SHOP_POOL;
            const availableItems = buildShopStock(pool, s.act, s.luck, s.armorPower, s.ownedWeapons);
            const availableCharms = buildCharmStock(s.ownedCharms.map((charm) => charm.id));
            for (const item of availableItems) {
              const art = getShopArt(item.id);
              if (art) useMeta.getState().collectPage(`art:${art.id}`);
            }
            for (const charm of availableCharms) {
              const art = getShopArt(charm.id);
              if (art) useMeta.getState().collectPage(`art:${art.id}`);
            }
            set({ status: "shop", shopItems: availableItems, shopCharms: availableCharms, shopkeeper });
            break;
          }
          case "rest": {
            const heal = Math.floor(s.maxHp * 0.3);
            const mana = Math.floor(s.maxMp * 0.3);
            audio.sfx("heal");
            set({
              status: "resolving",
              nodeResult: {
                logs: ["여백 위에서 잠시 숨을 고른다.", `체력 +${heal}, 집중력 +${mana}`],
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
              const art = getEncounterArt(encId);
              if (art) useMeta.getState().collectPage(`art:${art.id}`);
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

        if (nodeResult?.endsRun === "victory") {
          set({ status: "finalChoice", current: null, choices: [] });
          return;
        }
        if (nodeResult?.endsRun === "death") {
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

        if (nextAct > act) {
          set({
            act: nextAct, floor: 1, interludeAct: nextAct,
            current: null, nodeResult: null, battle: null, shopItems: null, shopCharms: null, shopkeeper: null, activeEncounter: null,
            status: "interlude", choices: [],
          });
          return;
        }

        set({
          act: nextAct, floor: nextFloor,
          current: null, nodeResult: null,
          battle: null, shopItems: null, shopCharms: null, shopkeeper: null, activeEncounter: null,
          status: "choosing",
          choices: generateChoices(seed, nextAct, nextFloor, FLOORS_PER_ACT),
        });
      },

      playerAttack: () => {
        const { battle, stats, weaponPower, armorPower } = get();
        if (!battle) return;
        audio.sfx("attack");
        const powerBonus = battle.openingRoll?.powerBonus ?? 0;
        const riposteBonus = battle.nextAttackBonus ?? 0;
        const baseDamage = Math.floor(stats.body * 1.8) + weaponPower + 1;
        const dmg = Math.max(1, baseDamage + powerBonus + riposteBonus);
        const enemyHp = battle.enemy.hp - dmg;
        const rollText = `공격 · ${dmg} 피해${powerBonus ? ` · 전투 전 판정 +${powerBonus}` : ""}${riposteBonus ? ` · 흘려낸 힘 +${riposteBonus}` : ""}`;
        const logs = [...battle.log, `당신이 몸을 낮추고 앞으로 나아간다. ${battle.enemy.name}의 형체가 흔들린다.`, rollText];

        if (enemyHp <= 0) return winBattle(get, set, logs);

        const incoming = modifyBossTelegraphDamage(battle,
          counterDamage(battle.enemy.atk, stats.will, armorPower, get().affinity));
        const hp = get().hp - incoming;
        audio.sfx("hit");
        logs.push(isLastBossTelegraph(battle)
          ? `마지막 장의 예고된 강공격이 밀려온다 · 체력 -${incoming}`
          : "종이가 찢기는 소리와 함께 반격이 밀려온다. 당신은 이를 악물고 자리를 지킨다.");

        if (hp <= 0) {
          set({
            battle: null, status: "resolving",
            nodeResult: { logs: [...logs, "…페이지가 찢어진다. 의식이 흐려진다."], endsRun: "death" },
          });
          return;
        }
        set({ hp, battle: { ...battle, enemy: { ...battle.enemy, hp: enemyHp }, turn: battle.turn + 1, nextAttackBonus: 0, log: logs } });
      },

      playerSkill: () => {
        const { battle, stats, mp, weaponPower, armorPower } = get();
        if (!battle) return;
        if (mp < 10) return get().addLog("집중력이 부족하다.", "sys");
        audio.sfx("attack");
        const powerBonus = battle.openingRoll?.powerBonus ?? 0;
        const riposteBonus = battle.nextAttackBonus ?? 0;
        const baseDamage = Math.floor(stats.resonance * 2.5) + 10 + weaponPower + 1;
        const dmg = Math.max(1, baseDamage + powerBonus + riposteBonus);
        const enemyHp = battle.enemy.hp - dmg;
        const rollText = `공격 · ${dmg} 피해${powerBonus ? ` · 전투 전 판정 +${powerBonus}` : ""}${riposteBonus ? ` · 흘려낸 힘 +${riposteBonus}` : ""}`;
        const logs = [...battle.log, "숨을 고르고 손끝에 빛을 모은다. 빛이 어둠의 틈을 가른다.", rollText];
        set({ mp: mp - 10 });
        if (enemyHp <= 0) return winBattle(get, set, logs);

        const incoming = modifyBossTelegraphDamage(battle,
          Math.max(1, battle.enemy.atk - Math.floor(stats.will * 0.3) - bondProtection(get().affinity) - armorPower));
        const hp = get().hp - incoming;
        audio.sfx("hit");
        logs.push(isLastBossTelegraph(battle)
          ? `마지막 장의 예고된 강공격이 빛을 밀어낸다 · 체력 -${incoming}`
          : "흩어진 그림자가 다시 몸을 세운다. 차가운 기운이 곁을 스친다.");
        if (hp <= 0) {
          set({ battle: null, status: "resolving", nodeResult: { logs: [...logs, "…페이지가 찢어진다."], endsRun: "death" } });
          return;
        }
        set({ hp, battle: { ...battle, enemy: { ...battle.enemy, hp: enemyHp }, turn: battle.turn + 1, nextAttackBonus: 0, log: logs } });
      },

      playerBrace: () => {
        const { battle, stats, weaponPower } = get();
        if (!battle || !isLastBossTelegraph(battle)) return;
        const baseDamage = Math.floor(stats.body * 1.8) + weaponPower + 1;
        const nextAttackBonus = Math.max(8, Math.floor(baseDamage * 0.8));
        audio.sfx("click");
        set({ battle: {
          ...battle,
          turn: battle.turn + 1,
          nextAttackBonus,
          log: [...battle.log, `마지막 장의 강공격을 흘려냈다. 다음 공격 피해 +${nextAttackBonus}.`],
        } });
      },

      useHealingPotion: () => useCombatPotion(get, set, "health"),
      useFocusPotion: () => useCombatPotion(get, set, "focus"),

      buyItem: (itemId) => {
        const { shopItems, gold, stats, armorPower, luck, healthPotions, focusPotions, ownedWeapons } = get();
        const item = shopItems?.find((x) => x.id === itemId);
        if (!item) return;
        if (item.stock !== undefined && item.stock <= 0) return;
        if (gold < item.price) return get().addLog("골드가 부족하다.", "sys");
        if (item.effect === "heal" && healthPotions >= MAX_CONSUMABLES) return;
        if (item.effect === "mana" && focusPotions >= MAX_CONSUMABLES) return;
        if (item.effect === "luck" && luck >= 1) return;
        if (item.effect === "weapon" && ownedWeapons.length >= MAX_WEAPON_INVENTORY) return;
        if (item.effect === "weapon" && ownedWeapons.some((weapon) =>
          weaponModifierKey(weapon.power, weapon.statBonus) === weaponModifierKey(item.amount, item.statBonus),
        )) return;
        if (item.effect === "armor" && armorPower >= MAX_ARMOR_POWER) return;
        set({
          gold: gold - item.price,
          shopItems: shopItems?.map((shopItem) => shopItem.id === itemId
            ? { ...shopItem, stock: Math.max(0, (shopItem.stock ?? 1) - 1) }
            : shopItem),
        });
        if (item.effect === "heal") set((s) => ({ healthPotions: Math.min(MAX_CONSUMABLES, s.healthPotions + 1) }));
        if (item.effect === "mana") set((s) => ({ focusPotions: Math.min(MAX_CONSUMABLES, s.focusPotions + 1) }));
        if (item.effect === "stat" && item.stat)
          set({ stats: { ...stats, [item.stat]: stats[item.stat] + item.amount } });
        if (item.effect === "weapon") {
          const weapon: WeaponItem = {
            id: `${item.id}-${Date.now()}`,
            name: item.name,
            power: item.amount,
            value: Math.max(1, Math.floor(item.price * 0.5)),
            statBonus: item.statBonus,
          };
          set((s) => ({
            ownedWeapons: [...s.ownedWeapons, weapon],
            pendingWeaponPrompt: { weaponId: weapon.id, source: "purchase" },
          }));
        }
        if (item.effect === "armor") set({ armorPower: Math.min(MAX_ARMOR_POWER, armorPower + item.amount) });
        if (item.effect === "luck") set({ luck: Math.min(1, luck + item.amount) });
        const detail = item.effect === "weapon" ? ` · 공격 피해 +${item.amount}`
          : item.effect === "armor" ? ` · 피격 피해 -${item.amount}`
          : item.effect === "luck" ? " · 주사위 보정 +1, 판정 +4%"
          : item.effect === "heal" ? " · 체력 물약 +1"
          : item.effect === "mana" ? " · 집중력 물약 +1" : "";
        get().addLog(`${item.name} 구매${detail}.`, "loot");
      },

      equipWeapon: (weaponId) => {
        const s = get();
        if (s.status === "battle" || s.status === "ended") return;
        const weapon = s.ownedWeapons.find((item) => item.id === weaponId);
        if (!weapon) return;
        const previous = s.ownedWeapons.find((item) => item.id === s.equippedWeaponId);
        const stats = { ...s.stats };
        for (const [stat, amount] of Object.entries(previous?.statBonus ?? {}) as [StatKey, number][]) stats[stat] -= amount;
        for (const [stat, amount] of Object.entries(weapon.statBonus ?? {}) as [StatKey, number][]) stats[stat] += amount;
        set({ equippedWeaponId: weapon.id, weaponPower: weapon.power, stats, pendingWeaponPrompt: null });
        get().addLog(`${weapon.name} 장착 · 공격 피해 +${weapon.power}${formatWeaponStatBonus(weapon.statBonus)}.`, "loot");
      },

      buyCharm: (charmId) => {
        const s = get();
        if (s.status !== "shop") return;
        const offer = s.shopCharms?.find((charm) => charm.id === charmId);
        if (!offer || offer.stock <= 0 || s.ownedCharms.some((charm) => charm.id === charmId)) return;
        if (s.gold < offer.price) return get().addLog("골드가 부족하다.", "sys");
        const charm: CharmItem = {
          id: offer.id, name: offer.name, price: offer.price, value: offer.value, effects: offer.effects,
        };
        set({
          gold: s.gold - offer.price,
          ownedCharms: [...s.ownedCharms, charm],
          shopCharms: s.shopCharms?.map((item) => item.id === charmId ? { ...item, stock: 0 } : item) ?? null,
        });
        get().addLog(`${charm.name} 구매 · ${formatCharmEffectSummary(charm.effects)}.`, "loot");
        if (!s.equippedCharmId) get().equipCharm(charm.id);
      },

      equipCharm: (charmId) => {
        const s = get();
        if (s.status === "battle" || s.status === "ended") return;
        const charm = s.ownedCharms.find((item) => item.id === charmId);
        if (!charm || charm.id === s.equippedCharmId) return;
        const previous = s.ownedCharms.find((item) => item.id === s.equippedCharmId);
        const stats = { ...s.stats };
        let maxHpDelta = 0;
        let maxMpDelta = 0;
        let luckDelta = 0;
        const apply = (effects: CharmEffect[] | undefined, direction: 1 | -1) => {
          for (const effect of effects ?? []) {
            if (effect.kind === "stat") stats[effect.stat] += effect.amount * direction;
            else if (effect.kind === "maxHp") maxHpDelta += effect.amount * direction;
            else if (effect.kind === "maxMp") maxMpDelta += effect.amount * direction;
            else luckDelta += effect.amount * direction;
          }
        };
        apply(previous?.effects, -1);
        apply(charm.effects, 1);
        const maxHp = Math.max(1, s.maxHp + maxHpDelta);
        const maxMp = Math.max(0, s.maxMp + maxMpDelta);
        set({
          equippedCharmId: charm.id,
          stats,
          maxHp,
          hp: Math.max(0, Math.min(maxHp, s.hp + maxHpDelta)),
          maxMp,
          mp: Math.max(0, Math.min(maxMp, s.mp + maxMpDelta)),
          luck: Math.max(0, s.luck + luckDelta),
        });
        get().addLog(`${charm.name} 장착 · ${formatCharmEffectSummary(charm.effects)}.`, "loot");
      },

      dismissWeaponPrompt: () => set({ pendingWeaponPrompt: null }),

      sellWeapon: (weaponId) => {
        const s = get();
        if (s.status !== "shop" || weaponId === s.equippedWeaponId) return;
        const weapon = s.ownedWeapons.find((item) => item.id === weaponId);
        if (!weapon) return;
        set({
          ownedWeapons: s.ownedWeapons.filter((item) => item.id !== weaponId),
          gold: s.gold + weapon.value,
        });
        get().addLog(`${weapon.name} 판매 · 골드 +${weapon.value}G.`, "loot");
      },

      closeShop: () => set({
        shopItems: null, shopCharms: null, shopkeeper: null, status: "resolving",
        nodeResult: { logs: ["상점을 뒤로하고 길을 나선다."] },
      }),

      pickEncounter: (act) => {
        const { flags, seenEncounters, storyId } = get();
        if (storyId === "unnamed_station") {
          const firstStoryEvent = ({
            1: "station_timetable",
            2: "station_window_echo",
            3: "station_gate_name",
          } as Record<number, string>)[act];
          if (firstStoryEvent && !seenEncounters.includes(firstStoryEvent)) return firstStoryEvent;
        }
        return pickWeightedEncounter(ENCOUNTERS, act, flags, seenEncounters, Math.random, storyId || undefined);
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
          const threshold = successChance(choice.check.stat, s.stats, choice.check, s.luck);
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
            ["골드", afterGold - s.gold], ["체력", afterHp - s.hp], ["집중력", afterMp - s.mp],
          ] as const) {
            if (change !== 0) effects.push(`${name} ${change > 0 ? "+" : ""}${change}`);
          }
          set({ gold: afterGold, hp: afterHp, mp: afterMp });
        }
        if (outcome.statUp) {
          const stats = { ...get().stats };
          for (const [stat, amount] of Object.entries(outcome.statUp) as [StatKey, number][]) {
            if (!amount) continue;
            stats[stat] += amount;
            effects.push(`${STAT_LABEL[stat]} ${amount > 0 ? "+" : ""}${amount}`);
          }
          set({ stats });
        }
        if (outcome.luck) {
          const before = get().luck;
          const luck = Math.max(0, Math.min(1, before + outcome.luck));
          if (luck !== before) {
            set({ luck });
            effects.push(`행운 주사위 보정 +${luck - before}`);
          }
        }
        if (outcome.weaponPower) {
          const before = get().weaponPower;
          const weaponPower = Math.max(0, Math.min(6, before + outcome.weaponPower));
          if (weaponPower !== before) {
            set({ weaponPower });
            effects.push(`공격 피해 +${weaponPower - before}`);
          }
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
        const resultArt = getEncounterArt(enc.id, get().flags, true);
        if (resultArt) useMeta.getState().collectPage(`art:${resultArt.id}`);
        s.addLog(`【${enc.title}】\n${choice.text}\n\n${outcome.text}${effectText}`, "sys");
        set({ encounterOutcome: { text: outcome.text, nextId: outcome.nextId, effects, battle: outcome.battle } });
      },

      continueEncounter: () => {
        const outcome = get().encounterOutcome;
        if (!outcome) return;
        if (outcome.battle) {
          const s = get();
          const enemy = spawnEnemy(s.level, s.seed, s.act, s.floor, false);
          enemy.name = outcome.battle.name;
          const difficulty = 12 + (s.act - 1) * 2;
          const openingRoll = rollBattleOpening(s.stats.body, s.luck, difficulty);
          const rollLabel = openingRoll.outcome === "great" ? "크리티컬!" : openingRoll.outcome === "success" ? "성공!" : openingRoll.outcome === "fumble" ? "대실패!" : "실패!";
          set({
            status: "battle",
            battle: { enemy, turn: 1, log: [`${enemy.name}이(가) 길을 막아선다. 페이지가 흔들린다.`] },
            nodeResult: null,
            activeEncounter: null,
            encounterOutcome: null,
          });
          const battle = get().battle;
          if (battle) set({ battle: {
            ...battle,
            openingRoll,
            log: [...battle.log, `전투 전 판정 ${rollLabel} · d20 ${openingRoll.rolled} + 힘·행운 ${openingRoll.modifier} = ${openingRoll.total} / ${difficulty}${openingRoll.powerBonus ? ` · 공격력 +${openingRoll.powerBonus}` : ""}`],
          } });
          return;
        }
        if (outcome.nextId) {
          const art = getEncounterArt(outcome.nextId);
          if (art) useMeta.getState().collectPage(`art:${art.id}`);
        }
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
      onRehydrateStorage: () => (state) => {
        if (state) rememberSeenArt(state.seenEncounters, state.flags);
        for (const slot of [1, 2, 3]) {
          try {
            const raw = localStorage.getItem(`endless-archive-run_slot${slot}`);
            const saved = raw ? JSON.parse(raw).state : null;
            rememberSeenArt(saved?.seenEncounters, saved?.flags);
          } catch { /* 읽을 수 없는 슬롯은 그대로 둔다. */ }
        }
      },
      version: 13,
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
        if (version < 8) {
          s.weaponPower = s.weaponPower ?? 0;
          s.luck = s.luck ?? 0;
        }
        if (version < 9) {
          s.storyId = s.storyId ?? "";
          s.interludeAct = s.interludeAct ?? null;
          s.finalDestination = s.finalDestination ?? null;
        }
        if (version < 10) {
          s.armorPower = s.armorPower ?? 0;
          s.shopkeeper = s.shopkeeper ?? null;
        }
        if (version < 11) {
          s.healthPotions = s.healthPotions ?? 1;
          s.focusPotions = s.focusPotions ?? 1;
          const legacyPower = s.weaponPower ?? 0;
          s.ownedWeapons = Array.isArray(s.ownedWeapons) ? s.ownedWeapons : legacyPower > 0
            ? [{ id: "legacy-equipped-weapon", name: "오래 써 온 무기", power: legacyPower, value: Math.max(6, legacyPower * 10) }]
            : [];
          s.equippedWeaponId = s.equippedWeaponId ?? (legacyPower > 0 ? "legacy-equipped-weapon" : null);
        }
        if (version < 12 && s.battle && !s.battle.openingRoll) {
          const boss = s.current?.type === "boss" || s.floor === FLOORS_PER_ACT;
          const difficulty = boss ? 14 + ((s.act ?? 1) - 1) * 2 : s.current?.type === "elite" ? 13 : 10;
          s.battle.openingRoll = rollBattleOpening(s.stats?.body ?? INITIAL_STATS.body, s.luck ?? 0, difficulty);
        }
        if (version < 13) {
          s.ownedCharms = Array.isArray(s.ownedCharms) ? s.ownedCharms : [];
          s.equippedCharmId = s.equippedCharmId ?? null;
          s.shopCharms = s.shopCharms ?? null;
          s.pendingWeaponPrompt = null;
          if (Array.isArray(s.shopItems)) {
            const definitions = [...SHOP_POOL, ...SPIRIT_SHOP_POOL];
            s.shopItems = s.shopItems.map((item: ShopItem) => {
              const definition = definitions.find((candidate) => candidate.id === item.id);
              return definition ? { ...definition, ...item, statBonus: item.statBonus ?? definition.statBonus } : item;
            });
          }
          if (s.status === "shop" && !s.shopCharms) {
            s.shopCharms = buildCharmStock(s.ownedCharms.map((charm: CharmItem) => charm.id));
          }
          const weapons: WeaponItem[] = Array.isArray(s.ownedWeapons) ? s.ownedWeapons : [];
          const equippedFirst = [...weapons].sort((a, b) => Number(b.id === s.equippedWeaponId) - Number(a.id === s.equippedWeaponId));
          const seenModifiers = new Set<string>();
          let duplicateWeaponGold = 0;
          s.ownedWeapons = equippedFirst.filter((weapon) => {
            const key = weaponModifierKey(weapon.power, weapon.statBonus);
            if (seenModifiers.has(key)) {
              duplicateWeaponGold += weapon.value ?? 0;
              return false;
            }
            seenModifiers.add(key);
            return true;
          });
          s.gold = (s.gold ?? 0) + duplicateWeaponGold;
          if (Array.isArray(s.shopItems)) {
            s.shopItems = s.shopItems.filter((item: ShopItem) => item.effect !== "weapon" || !s.ownedWeapons.some((weapon: WeaponItem) =>
              weaponModifierKey(weapon.power, weapon.statBonus) === weaponModifierKey(item.amount, item.statBonus),
            ));
          }
        }
        return s;
      },
      partialize: (s) => ({
        seed: s.seed, storyId: s.storyId, act: s.act, floor: s.floor, stats: s.stats,
        hp: s.hp, maxHp: s.maxHp, mp: s.mp, maxMp: s.maxMp,
        weaponPower: s.weaponPower, armorPower: s.armorPower, luck: s.luck,
        healthPotions: s.healthPotions, focusPotions: s.focusPotions,
        ownedWeapons: s.ownedWeapons, equippedWeaponId: s.equippedWeaponId,
        ownedCharms: s.ownedCharms, equippedCharmId: s.equippedCharmId,
        gold: s.gold, level: s.level, exp: s.exp, statPoints: s.statPoints,
        choices: s.choices, current: s.current, status: s.status,
        nodeResult: s.nodeResult, battle: s.battle, shopItems: s.shopItems, shopCharms: s.shopCharms, shopkeeper: s.shopkeeper,
        activeEncounter: s.activeEncounter, encounterOutcome: s.encounterOutcome, seenEncounters: s.seenEncounters, autoBattle: s.autoBattle, prologueStep: s.prologueStep, interludeAct: s.interludeAct, finalDestination: s.finalDestination, endingRecorded: s.endingRecorded, endingResult: s.endingResult, affinity: s.affinity,
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
type Set = (p: Partial<RunState> | ((state: RunState) => Partial<RunState>)) => void;

function counterDamage(atk: number, will: number, armorPower: number, affinity: Record<NpcId, number>) {
  return Math.max(1, atk - Math.floor(will * 0.3) - bondProtection(affinity) - armorPower + Math.floor(Math.random() * 4) - 2);
}

function modifyBossTelegraphDamage(battle: BattleState, incoming: number) {
  return isLastBossTelegraph(battle) ? Math.ceil(incoming * 1.4) : incoming;
}

function useCombatPotion(get: Get, set: Set, type: "health" | "focus") {
  const s = get();
  const inBattle = s.status === "battle" && Boolean(s.battle);
  if (s.status === "ended" || (s.status === "resolving" && s.nodeResult?.endsRun)) return;
  if (inBattle && s.autoBattle) return;
  if (type === "health" && (s.healthPotions <= 0 || s.hp >= s.maxHp)) return;
  if (type === "focus" && (s.focusPotions <= 0 || s.mp >= s.maxMp)) return;

  const healing = type === "health" ? Math.max(12, Math.ceil(s.maxHp / 5)) : 0;
  const focus = type === "focus" ? Math.max(8, Math.ceil(s.maxMp / 5)) : 0;
  const recoveredHp = Math.min(s.maxHp, s.hp + healing);
  const recoveredMp = Math.min(s.maxMp, s.mp + focus);
  const incoming = inBattle && s.battle
    ? modifyBossTelegraphDamage(s.battle, counterDamage(s.battle.enemy.atk, s.stats.will, s.armorPower, s.affinity))
    : 0;
  const hp = recoveredHp - incoming;
  const potionLabel = type === "health" ? "체력 물약" : "집중력 물약";
  const recovery = type === "health" ? `체력 +${recoveredHp - s.hp}` : `집중력 +${recoveredMp - s.mp}`;
  audio.sfx("heal");

  if (!inBattle || !s.battle) {
    set({
      hp: recoveredHp,
      mp: recoveredMp,
      healthPotions: s.healthPotions - (type === "health" ? 1 : 0),
      focusPotions: s.focusPotions - (type === "focus" ? 1 : 0),
    });
    get().addLog(`${potionLabel} 사용 · ${recovery}`, "heal");
    return;
  }

  const logs = [
    ...s.battle.log,
    `${potionLabel} 사용 · ${recovery}`,
    `${isLastBossTelegraph(s.battle) ? "마지막 장의 예고된 강공격" : `${s.battle.enemy.name}의 반격`} · 체력 -${incoming}`,
  ];
  audio.sfx("hit");

  if (hp <= 0) {
    set({
      hp: 0,
      mp: recoveredMp,
      healthPotions: s.healthPotions - (type === "health" ? 1 : 0),
      focusPotions: s.focusPotions - (type === "focus" ? 1 : 0),
      battle: null,
      status: "resolving",
      nodeResult: { logs: [...logs, "물약을 비웠지만 반격을 버티지 못했다.", "…페이지가 찢어진다."], endsRun: "death" },
    });
    return;
  }

  set({
    hp,
    mp: recoveredMp,
    healthPotions: s.healthPotions - (type === "health" ? 1 : 0),
    focusPotions: s.focusPotions - (type === "focus" ? 1 : 0),
    battle: { ...s.battle, turn: s.battle.turn + 1, log: logs },
  });
}

function winBattle(get: Get, set: Set, logs: string[]) {
  const { battle, exp, level, gold, maxHp, maxMp } = get();
  if (!battle) return;
  const e = battle.enemy;
  const isVictory = e.name.includes("마지막 장");
  const difficultyBonus = Math.max(2, Math.round(e.maxHp * 0.05 + e.atk * 0.4));
  const coinReward = e.gold + difficultyBonus;
  logs.push(`${e.name}을(를) 쓰러뜨렸다! +${e.exp}EXP +${coinReward}G (난이도 보정 +${difficultyBonus}G)`);

  let lootGold = 0;
  const lootRoll = Math.random();
  const weaponDropChance = e.exp >= 70 ? 0.18 : 0.08;
  if (lootRoll < 0.15) {
    if (get().healthPotions < MAX_CONSUMABLES) {
      set((s) => ({ healthPotions: s.healthPotions + 1 }));
      logs.push("전리품 · 체력 물약 1개");
    } else {
      lootGold = 6;
      logs.push("물약 가방이 가득 차 대신 6G를 챙겼다.");
    }
  } else if (lootRoll < 0.28) {
    if (get().focusPotions < MAX_CONSUMABLES) {
      set((s) => ({ focusPotions: s.focusPotions + 1 }));
      logs.push("전리품 · 집중력 물약 1개");
    } else {
      lootGold = 6;
      logs.push("물약 가방이 가득 차 대신 6G를 챙겼다.");
    }
  } else if (lootRoll < 0.28 + weaponDropChance) {
    if (get().ownedWeapons.length < MAX_WEAPON_INVENTORY) {
      const act = Math.min(3, Math.max(1, get().act));
      const lootWeapons = [
        { name: "회수한 철필", power: 1, value: 8, statBonus: { charm: 1 } },
        { name: "흠집 난 제본검", power: 2, value: 18, statBonus: { insight: 1 } },
        { name: "역무원의 절단검", power: 3, value: 32, statBonus: { will: 1 } },
      ];
      const weapon = lootWeapons[act - 1];
      if (get().ownedWeapons.some((existing) => weaponModifierKey(existing.power, existing.statBonus) === weaponModifierKey(weapon.power, weapon.statBonus))) {
        lootGold = 8;
        logs.push("\uac19\uc740 \ubcf4\uc815 \ubb34\uae30\ub97c \ub300\uc2e0 8G\ub85c \ubc14\uafd8 \uac00\uc838\uac14\ub2e4.");
      } else {
        const lootId = `loot-${e.id}-${Date.now()}`;
        set((s) => ({
          ownedWeapons: [...s.ownedWeapons, { ...weapon, id: lootId }],
          pendingWeaponPrompt: !isVictory && weapon.power > s.weaponPower
            ? { weaponId: lootId, source: "loot" }
            : s.pendingWeaponPrompt,
        }));
        logs.push(`전리품 · ${weapon.name} (공격 피해 +${weapon.power}${formatWeaponStatBonus(weapon.statBonus)})`);
      }
    } else {
      lootGold = 8;
      logs.push("무기 보관함이 가득 차 대신 8G를 챙겼다.");
    }
  }

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

  set({
    battle: null,
    hp: Math.min(maxHp + bonusHp, get().hp + Math.floor(maxHp * 0.2)),
    mp: Math.min(maxMp + bonusMp, get().mp + Math.floor(maxMp * 0.2)),
    gold: gold + coinReward + lootGold,
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
