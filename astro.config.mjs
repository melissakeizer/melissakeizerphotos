// @ts-check
import { defineConfig } from 'astro/config';
import { storyEditorPlugin } from './scripts/story-editor-plugin.mjs';
import { contentBoardPlugin } from './scripts/content-board-plugin.mjs';
import { pruneResponsiveOutput } from './scripts/prune-responsive-output.mjs';
import { photoStreamUploadPlugin } from './scripts/photostream-upload-plugin.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://melissakeizer.photos',
  // Production lives at the domain root. The dev command supplies its local base.
  base: '/',
  output: 'static',
  integrations: [pruneResponsiveOutput()],
  vite: {
    build: { target: ['es2017', 'safari12'] },
    plugins: [storyEditorPlugin(), contentBoardPlugin(), photoStreamUploadPlugin()],
  },
});
