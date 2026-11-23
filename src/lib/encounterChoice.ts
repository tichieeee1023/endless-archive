import type { EncounterChoice } from "../types/encounter";
import type { Stats } from "../types/game";

/** The same requirements are enforced by the store and presented by the UI. */
export function isChoiceAvailable(choice: EncounterChoice, flags: string[], stats: Stats): boolean {
  const req = choice.require;
  if (!req) return true;
  if (req.flag && !flags.includes(req.flag)) return false;
  if (req.flagsAll?.some((flag) => !flags.includes(flag))) return false;
  if (req.stat && req.min !== undefined && stats[req.stat] < req.min) return false;
  return true;
}
