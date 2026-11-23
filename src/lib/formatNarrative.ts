/** 원문은 그대로 두고, 빈 줄 없이 각 문단의 첫 줄을 들여쓴다. */
export function formatNarrative(text: string): string {
  return text
    .replace(/([.!?。！？…])[ \t]+(?=[“「"])/g, "$1\n")
    .replace(/([”」"])[ \t]+(?=[가-힣A-Za-z])/g, "$1\n")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `\u3000${line}`)
    .join("\n");
}
