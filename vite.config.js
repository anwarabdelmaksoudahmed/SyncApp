import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'User Sync App',
        short_name: 'UserSync',
        description: 'تطبيق مزامنة المستخدمين مع دعم العمل دون اتصال',
        theme_color: '#4CAF50',
        icons: [
          {
            src: '/vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  server: {
    hmr: false,
    watch: {
      usePolling: true
    },
    port: 5173,
    strictPort: true,
    host: true
  },
  esbuild: {
    jsxInject: `import React from 'react'`
  }
}) 