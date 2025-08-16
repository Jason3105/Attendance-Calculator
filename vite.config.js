import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {},
  server: {},
  // Add this for SPA fallback
  preview: {
    // For Render, fallback to index.html
    fallback: 'index.html'
  }
})
