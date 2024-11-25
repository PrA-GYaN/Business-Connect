import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    cssMinify: false,
  },
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 5173,       // Make sure this is the port you want
  },
})