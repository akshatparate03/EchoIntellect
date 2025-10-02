import type { ModelKey } from "./api";

export type ModelResponses = Record<ModelKey, string | undefined>;

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter(Boolean);
}

export function computeUniqueSentences(responses: ModelResponses) {
  const entries = Object.entries(responses).filter(([, v]) => v) as [
    ModelKey,
    string
  ][];
  const sentenceMaps: Partial<Record<ModelKey, string[]>> = Object.fromEntries(
    entries.map(([k, v]) => [k, splitSentences(v)])
  );
  const allSets: Record<ModelKey, Set<string>> = {} as any;
  for (const [k, arr] of Object.entries(sentenceMaps)) {
    allSets[k as ModelKey] = new Set(arr);
  }

  const uniqueIndices: Record<ModelKey, Set<number>> = {} as any;
  for (const [k, arr] of Object.entries(sentenceMaps)) {
    const set = new Set<number>();
    arr.forEach((s, idx) => {
      let appearsElsewhere = false;
      for (const [k2, set2] of Object.entries(allSets)) {
        if (k2 === k) continue;
        if (set2.has(s)) {
          appearsElsewhere = true;
          break;
        }
      }
      if (!appearsElsewhere) set.add(idx);
    });
    uniqueIndices[k as ModelKey] = set;
  }
  return { sentences: sentenceMaps, uniqueIndices };
}
