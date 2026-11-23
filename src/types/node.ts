import type { Stats } from "./game";

export interface NodeResult {
  logs: string[];
  reward?: { gold?: number; hp?: number; mp?: number; exp?: number };
  statUp?: Partial<Stats>;
  endsRun?: "victory" | "death";
}

export type ShopItem = {
  id: string;
  name: string;
  price: number;
  effect: "heal" | "mana" | "stat" | "weapon" | "luck";
  stat?: keyof Stats;
  amount: number;
};
