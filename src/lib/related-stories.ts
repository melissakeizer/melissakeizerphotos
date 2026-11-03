interface RelatedCandidate { id: string; categories: string[]; order?: number; }

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
  const selected = ranked.filter(item => item.shared > 0).slice(0, 4);
  const chosen = new Set(selected.map(item => item.id));
  const represented = new Set(selected.flatMap(item => item.categories));
  const pool = ranked.filter(item => !chosen.has(item.id)).sort((a,b) =>
    (a.order ?? 999) - (b.order ?? 999) || a.rank - b.rank);
  // Closest matches first, then favour the editorial order and a mix of categories.
  while (selected.length < 6 && pool.length) {
    let index = pool.findIndex(item => item.categories.some(category => !represented.has(category)));
    if (index < 0) index = 0;
    const [item] = pool.splice(index, 1);
    selected.push(item);
    item.categories.forEach(category => represented.add(category));
  }
  return selected.map(item => item.id);
}
