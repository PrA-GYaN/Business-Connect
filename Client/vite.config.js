import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    cssMinify: false,
  },
  server: {
    // https: {
    //   key: fs.readFileSync('./src/assets/private.pem'),
    //   cert: fs.readFileSync('./src/assets/certificate.pem'),
    // },
    host:'0.0.0.0',
    port: 5173,  // Adjust port if necessary
  },
})