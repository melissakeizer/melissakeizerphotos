import { getCollection } from 'astro:content';
import { categoriesForStory } from './story-metadata';
export const archivePageSize = 18;
export async function archivePages(category = 'all') {
  const stories = await getCollection('stories', ({ data }) => !data.draft || (import.meta.env.DEV && data.previewLocally));
  const filtered = stories.filter(story => category === 'all' || categoriesForStory(story.id, story.data.categories).some(c => c.replace(/\s+/g, '-') === category));
  filtered.sort((a,b) => a.data.order - b.data.order || a.id.localeCompare(b.id));
  const totalPages = Math.max(1, Math.ceil(filtered.length / archivePageSize));
  return Array.from({length: totalPages}, (_, i) => ({ stories: filtered.slice(i * archivePageSize, (i+1) * archivePageSize), currentPage: i+1, totalPages, category }));
}
