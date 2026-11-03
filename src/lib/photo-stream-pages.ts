import sharp from 'sharp';
import { resolve } from 'node:path';
import { photoStreamNotes } from './field-notes';
import { allPhotoStreamQuestions } from './photo-stream-questions';
import photoStreamPlan from '../data/photo-stream-plan.json';
import { resolvePhotoStreamPlan } from './photo-stream-plan.mjs';
import { photoStreamLocations } from './photo-stream-links';

export async function getPhotoStreamPages() {
  const layout = resolvePhotoStreamPlan(photoStreamPlan, photoStreamNotes, allPhotoStreamQuestions);
  const dimensions = new Map<string, { width: number; height: number }>();
  await Promise.all(photoStreamNotes.map(async note => {
    const metadata = await sharp(resolve('public/photos/00-photostream', note.image)).metadata();
    const rotated = (metadata.orientation ?? 1) >= 5;
    const width = rotated ? metadata.height : metadata.width;
    const height = rotated ? metadata.width : metadata.height;
    if (width && height) dimensions.set(note.image, { width, height });
  }));
  const locations = photoStreamLocations(layout.pages);
  return {
    ...layout,
    dimensions,
    locations,
  };
}
