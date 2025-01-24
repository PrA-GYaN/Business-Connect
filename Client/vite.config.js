import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    cssMinify: false,
    minify: false,
  },
  server: {
    port: process.env.PORT || 5173,
    host: '0.0.0.0',
  },
})