/*
 * @Author: jean cw252128385@gmail.com
 * @Date: 2026-03-20 13:39:04
 * @LastEditors: jean cw252128385@gmail.com
 * @LastEditTime: 2026-04-16 15:15:28
 * @FilePath: \ai-code-mother-scratch-frontend\vite.config.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8123',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
