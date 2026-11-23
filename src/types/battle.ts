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
}