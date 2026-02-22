import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // 1. Import path

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 2. Define the @ alias to point to the src folder
      '@': path.resolve(__dirname, './src'),
    },
  },
})