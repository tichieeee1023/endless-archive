/** Move a pre-slot save before the run store reads its first persisted state. */
export function migrateLegacySave(storage: Pick<Storage, "getItem" | "setItem" | "removeItem">) {
  const oldKey = "endless-archive-run";
  const firstSlot = `${oldKey}_slot1`;
  const legacy = storage.getItem(oldKey);
  if (legacy !== null && storage.getItem(firstSlot) === null) {
    // Do not delete the only copy if writing the destination fails.
    storage.setItem(firstSlot, legacy);
    storage.removeItem(oldKey);
  }
}
