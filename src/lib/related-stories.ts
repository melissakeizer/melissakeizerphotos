interface RelatedCandidate { id: string; categories: string[]; }

// Stable per story, without always favouring the earliest published entries.
function rank(seed: string) {
  let hash = 2166136261;
  for (const character of seed) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
}

export function relatedStoryIds(current: RelatedCandidate, candidates: RelatedCandidate[]) {
  const ranked = candidates.filter(item => item.id !== current.id).map(item => ({
    ...item,
    shared: item.categories.filter(category => current.categories.includes(category)).length,
    rank: rank(`${current.id}:${item.id}`),
  })).sort((a, b) => b.shared - a.shared || a.rank - b.rank || a.id.localeCompare(b.id));
  const matches = ranked.filter(item => item.shared > 0).slice(0, 4);
  const selected = new Set(matches.map(item => item.id));
  const wildcards = ranked.filter(item => !selected.has(item.id))
    .sort((a, b) => a.shared - b.shared || a.rank - b.rank || a.id.localeCompare(b.id))
    .slice(0, 6 - matches.length);
  return [...matches, ...wildcards].map(item => item.id);
}
