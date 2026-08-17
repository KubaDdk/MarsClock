import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path matches the GitHub Pages project URL: https://<user>.github.io/MarsClock/
export default defineConfig({
  base: '/MarsClock/',
  plugins: [react()],
})
