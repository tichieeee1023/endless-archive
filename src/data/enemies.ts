import type { Enemy } from "../types/battle";
import { mulberry32, hashSeed } from "../lib/rng";

const POOL = [
  { name: "뒤틀린 문장", hp: 20, atk: 4, exp: 5, gold: 5 },
  { name: "페이지의 그림자", hp: 35, atk: 7, exp: 10, gold: 12 },
  { name: "활자를 삼킨 것", hp: 50, atk: 10, exp: 18, gold: 20 },
  { name: "금서의 수호자", hp: 80, atk: 15, exp: 30, gold: 40 },
];

const BOSSES: Record<number, { name: string; hp: number; atk: number; exp: number; gold: number }> = {
  1: { name: "이야기의 끝 — 첫 장", hp: 90, atk: 13, exp: 70, gold: 100 },
  2: { name: "이야기의 끝 — 중간 장", hp: 140, atk: 17, exp: 140, gold: 200 },
  3: { name: "이야기의 끝 — 마지막 장", hp: 200, atk: 21, exp: 280, gold: 500 },
};

export function spawnEnemy(
  level: number, seed: string, act: number, floor: number, isBoss: boolean,
): Enemy {
  const rng = mulberry32(hashSeed(`${seed}-battle-${act}-${floor}`));
  const scale = isBoss ? 1 : 1 + (level - 1) * 0.12;
  const availableMobs = Math.min(POOL.length, act + 1);
  const base = isBoss
    ? (BOSSES[act] ?? BOSSES[1])
    : POOL[Math.floor(rng() * availableMobs)];
  const hp = Math.floor(base.hp * scale);
  return {
    id: `${seed}-${act}-${floor}-${isBoss ? "boss" : "mob"}`,
    name: base.name,
    hp, maxHp: hp,
    atk: Math.floor(base.atk * scale),
    exp: Math.floor(base.exp * scale),
    gold: Math.floor(base.gold * scale),
  };
}
