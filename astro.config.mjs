import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://casebound.co',
  output: 'static',
  integrations: [
    sitemap(),
  ],
});
