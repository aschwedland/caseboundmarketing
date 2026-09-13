import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://casebound.co',
  output: 'static',
  integrations: [
    sitemap({
      // /reset-password is only reached from a reset email; keep it out of search.
      filter: (page) => !page.includes('/reset-password'),
    }),
  ],
});
