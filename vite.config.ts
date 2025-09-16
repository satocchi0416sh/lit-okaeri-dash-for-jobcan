import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import webExtension from '@samrum/vite-plugin-web-extension'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: {
        manifest_version: 3,
        name: "Jobcan Okaeri Dash",
        version: "1.0.0",
        description: "Jobcanの打刻場所選択をリッチなUIに改善",
        action: {
          default_popup: "index.html"
        },
        content_scripts: [
          {
            matches: ["https://*.jobcan.jp/employee", "http://*.jobcan.jp/employee"],
            js: ["src/content/content.ts"],
            css: ["src/content/styles.css"]
          },
          {
            matches: ["https://*.jobcan.jp/employee/adit/modify*", "http://*.jobcan.jp/employee/adit/modify*"],
            js: ["src/content/modify-content.ts"],
            css: ["src/content/styles.css", "src/content/modify-styles.css"]
          }
        ],
        permissions: ["storage"],
        host_permissions: ["https://*.jobcan.jp/*", "http://*.jobcan.jp/*"]
      }
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        content: resolve(__dirname, 'src/content/content.ts'),
        modifyContent: resolve(__dirname, 'src/content/modify-content.ts'),
      },
    },
  },
})