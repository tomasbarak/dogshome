export default defineNuxtConfig({
  devtools: { enabled: false },

  devServer: {
    port: 8443,
  },

  modules: ["@nuxtjs/tailwindcss", 'nuxt-icon', ['@nuxtjs/google-fonts', {
    families: {
        Lato: {
            wght: [100, 300, 400, 700, 900],
        },
    },
    display: 'swap',
    subsets: 'latin',
    prefetch: false,
    preconnect: false,
    preload: false,
    download: true,
    base64: false
  }]],
  plugins: [
    {src: '~/plugins/firebase.client.ts', mode: 'client'},
  ],
})