// @ts-check
import { defineConfig } from 'astro/config';
import { storyEditorPlugin } from './scripts/story-editor-plugin.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://melissakeizer.github.io',
  base: '/melissakeizerphotos',
  output: 'static',
  vite: {
    plugins: [storyEditorPlugin()],
  },
});
