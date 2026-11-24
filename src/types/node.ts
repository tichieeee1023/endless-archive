import type { Stats } from "./game";

export interface NodeResult {
  logs: string[];
  reward?: { gold?: number; hp?: number; mp?: number; exp?: number };
  statUp?: Partial<Stats>;
  endsRun?: "victory" | "death" | "defeat";
  rescued?: boolean;
}

export type ShopItem = {
  id: string;
  name: string;
  price: number;
  effect: "heal" | "mana" | "stat" | "weapon" | "armor" | "luck";
  stat?: keyof Stats;
  amount: number;
  statBonus?: Partial<Stats>;
  stock?: number;
  minAct?: number;
};

export interface WeaponItem {
  id: string;
  name: string;
  power: number;
  value: number;
  statBonus?: Partial<Stats>;
}

export type CharmEffect =
  | { kind: "stat"; stat: keyof Stats; amount: number }
  | { kind: "maxHp" | "maxMp" | "luck"; amount: number };

export interface CharmItem {
  id: string;
  name: string;
  price: number;
  value: number;
  effects: CharmEffect[];
}

export interface ShopCharmOffer extends CharmItem {
  stock: number;
}
