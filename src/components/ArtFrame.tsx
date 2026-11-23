import type { ArtEntry } from "../data/artLibrary";

/** A compact ink-on-white panoramic illustration, sized for mobile story sheets. */
export default function ArtFrame({ art, variant = "scene", eager = false }: {
  art: ArtEntry | undefined;
  variant?: "scene" | "ending" | "recall";
  eager?: boolean;
}) {
  if (!art) return null;
  return (
    <figure className={`archive-artframe archive-artframe--${variant}`}>
      <img src={art.src} alt={art.title} width={768} height={384}
        loading={eager ? "eager" : "lazy"} decoding="async" />
    </figure>
  );
}
