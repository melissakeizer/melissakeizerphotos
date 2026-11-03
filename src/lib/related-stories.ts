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
  return ranked.filter(item => item.shared > 0).slice(0, 4).map(item => item.id);
}
