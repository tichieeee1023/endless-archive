// Place public/art at the Vite project's public/art directory.
// All IDs are stable asset IDs; match enemy.name or boss act in game logic.
export const EXTRA_ART = {
  enemy_twisted_sentence: "/art/enemies/enemy_twisted_sentence.webp",
  enemy_page_shadow: "/art/enemies/enemy_page_shadow.webp",
  enemy_type_devourer: "/art/enemies/enemy_type_devourer.webp",
  enemy_forbidden_guardian: "/art/enemies/enemy_forbidden_guardian.webp",
  boss_act_1: "/art/enemies/boss_act_1.webp",
  boss_act_2: "/art/enemies/boss_act_2.webp",
  boss_act_3: "/art/enemies/boss_act_3.webp",
  battle_common: "/art/enemies/battle_common.webp",
  act_transition_1: "/art/act/act_transition_1.webp",
  act_transition_2: "/art/act/act_transition_2.webp",
  act_transition_3: "/art/act/act_transition_3.webp",
  node_battle: "/art/node/node_battle.webp",
  node_event: "/art/node/node_event.webp",
  node_shop: "/art/node/node_shop.webp",
  node_rest: "/art/node/node_rest.webp",
  node_treasure: "/art/node/node_treasure.webp",
  scene_shop: "/art/scene/scene_shop.webp",
  scene_rest: "/art/scene/scene_rest.webp",
  scene_defeat: "/art/scene/scene_defeat.webp",
  scene_journey_end: "/art/scene/scene_journey_end.webp",
  levelup_book: "/art/levelup/levelup_book.webp",
  levelup_cards: "/art/levelup/levelup_cards.webp",
  levelup_compass: "/art/levelup/levelup_compass.webp",
} as const;

export type ExtraArtId = keyof typeof EXTRA_ART;
