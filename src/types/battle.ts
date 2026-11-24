export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  exp: number;
  gold: number;
}

export interface BattleState {
  enemy: Enemy;
  turn: number;
  log: string[];
  nextAttackBonus?: number;
  companionGuard?: boolean;
  openingRoll?: {
    rolled: number;
    modifier: number;
    total: number;
    difficulty: number;
    outcome: "fumble" | "failed" | "success" | "great";
    powerBonus: number;
  };
}
