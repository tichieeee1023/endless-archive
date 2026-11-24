# Character accents

- Base: release-art-hotfix; preserve corrected Seon art and all other assets.
- Palette (single source: `src/data/npcs.ts`): Rael #59788d (ink blue), Seon #a46c50 (terracotta), Kairu #806a99 (dusty violet).
- 3px left borders on character-specific known destinations, notebook threads and ending cards; 2px left borders on encounter headings, rescue headings, character ending and recall sections. Small rounded left corners. Character label and known affinity hearts use the same accent. No global page or image tint.
- Only explicit NPC IDs are used; random choices and neutral story scenes do not disclose the future encounter. No changes to RNG, story, balance, saves or art.
- Verification: 190 automated tests, including 4 new accent tests. Browser CSS representative markup checks at 320, 390 and 1024px. Full React/Vite production build and deployment not performed (dependencies unavailable in this environment).
