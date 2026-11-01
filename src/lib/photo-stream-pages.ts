import sharp from 'sharp';
import { resolve } from 'node:path';
import { photoStreamNotes } from './field-notes';
import { photoStreamQuestions } from './photo-stream-questions';
import { paginatePhotoStream } from './photo-stream-pagination';

export async function getPhotoStreamPages() {
  const landscapeImages = new Set<string>();
  await Promise.all(photoStreamNotes.map(async note => {
    const metadata = await sharp(resolve('public/photos/00-photostream', note.image)).metadata();
    const rotated = (metadata.orientation ?? 1) >= 5;
    const width = rotated ? metadata.height : metadata.width;
    const height = rotated ? metadata.width : metadata.height;
    if ((width ?? 0) >= (height ?? 0)) landscapeImages.add(note.image);
  }));
  return {
    landscapeImages,
    pages: paginatePhotoStream(photoStreamNotes, landscapeImages,
      new Set(photoStreamQuestions.map(block => block.beforeImage))),
  };
}
