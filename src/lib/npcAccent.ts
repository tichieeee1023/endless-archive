import type { CSSProperties } from "react";
import { NPCS } from "../data/npcs";
import type { NpcId } from "../types/npc";

// Only an explicit character identity may add a colour. Unrelated scenes stay neutral.
export function npcAccent(id: string | null | undefined): { "data-npc"?: NpcId; style?: CSSProperties } {
  if (id !== "rael" && id !== "seon" && id !== "kairu") return {};
  return { "data-npc": id, style: { "--npc-accent": NPCS[id].color } as CSSProperties };
}
