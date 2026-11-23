export function seedFromUrl(): string | null {
  const url = new URL(window.location.href);
  const seed = url.searchParams.get("seed");
  return seed && seed.length <= 16 ? seed : null;
}

export function shareUrl(seed: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set("seed", seed);
  return url.toString();
}