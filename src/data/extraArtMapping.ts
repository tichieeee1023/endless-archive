import { EXTRA_ART } from "./extraArt";
import type { NodeType } from "../types/game";

const ENEMIES: Record<string, string> = {
  "뒤틀린 문장": EXTRA_ART.enemy_twisted_sentence,
  "페이지의 그림자": EXTRA_ART.enemy_page_shadow,
  "활자를 삼킨 것": EXTRA_ART.enemy_type_devourer,
  "금서의 수호자": EXTRA_ART.enemy_forbidden_guardian,
  "잉크의 파수꾼": EXTRA_ART.enemy_forbidden_guardian,
  "유리창의 그림자": EXTRA_ART.enemy_page_shadow,
  "역명을 삼킨 것": EXTRA_ART.enemy_type_devourer,
  "이야기의 끝 — 첫 장": EXTRA_ART.boss_act_1,
  "이야기의 끝 — 중간 장": EXTRA_ART.boss_act_2,
  "이야기의 끝 — 마지막 장": EXTRA_ART.boss_act_3,
};

const NODES: Record<NodeType, string> = {
  battle: EXTRA_ART.node_battle, elite: EXTRA_ART.node_battle, boss: EXTRA_ART.node_battle,
  event: EXTRA_ART.node_event, shop: EXTRA_ART.node_shop,
  rest: EXTRA_ART.node_rest, treasure: EXTRA_ART.node_treasure,
};

const ACTS = [EXTRA_ART.act_transition_1, EXTRA_ART.act_transition_2, EXTRA_ART.act_transition_3];
const LEVELS = [EXTRA_ART.levelup_book, EXTRA_ART.levelup_cards, EXTRA_ART.levelup_compass];

export const enemyArt = (name: string) => ENEMIES[name] ?? EXTRA_ART.battle_common;
export const nodeArt = (type: NodeType) => NODES[type];
export const actArt = (act: number) => ACTS[Math.min(2, Math.max(0, act - 1))];
export const levelArt = (level: number) => LEVELS[Math.max(0, level - 2) % LEVELS.length];
