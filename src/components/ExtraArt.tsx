import { useState } from "react";

/** Decorative art; a failed image disappears or falls back without affecting play. */
export default function ExtraArt({ src, fallback, className = "" }: {
  src: string; fallback?: string; className?: string;
}) {
  const [failed, setFailed] = useState<string[]>([]);
  const display = failed.includes(src) ? fallback : src;
  if (!display || failed.includes(display)) return null;
  return <img className={`extra-art ${className}`} src={display} alt="" decoding="async"
    onError={() => setFailed((previous) => [...previous, display])} />;
}
