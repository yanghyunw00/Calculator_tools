import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Served from https://yanghyunw00.github.io/project/calc/
  base: '/project/calc/',
  plugins: [react(), tailwindcss()],
})
