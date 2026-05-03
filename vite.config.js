import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        letters: resolve(__dirname, 'pages/letters.html'),
        memories: resolve(__dirname, 'pages/memories.html'),
        favchapter: resolve(__dirname, 'pages/fav-chapter.html'),
        wishes: resolve(__dirname, 'pages/wishes.html'),
      }
    }
  }
})
