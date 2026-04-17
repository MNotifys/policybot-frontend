// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Pure SPA — IndexedDB is browser-only, no SSR needed
  ssr: false,

  modules: ['@pinia/nuxt'],

  css: [
    '~/assets/css/main.css',
    'highlight.js/styles/github.css', // swap for github-dark.css if you prefer dark code blocks
  ],

  typescript: {
    strict: true,
  },

  // Expose backend URL via runtime config so it can be overridden via .env
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000',
    },
  },

  compatibilityDate: '2024-11-01',
})
