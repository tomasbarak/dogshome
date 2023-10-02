export default defineNuxtConfig({
  devtools: { enabled: true },

  devServer: {
    port: 8443,
  },

  modules: ["@nuxtjs/tailwindcss", 'nuxt-icon'],
  plugins: [
    {src: '~/plugins/firebase.client.ts', mode: 'client'},
    {src: '~/plugins/firebase.server.ts', mode: 'server'},
  ]
})