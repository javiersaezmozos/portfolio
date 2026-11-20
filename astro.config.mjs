import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.javisaez.com',
  output: 'hybrid',
  adapter: cloudflare({
    imageService: 'passthrough',
    platformProxy: {
      enabled: true
    }
  }),
  integrations: [tailwind()],
  base: process.env.GITHUB_ACTIONS ? '/portfolio' : '/',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en', 'de', 'it'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false
    }
  }
});
