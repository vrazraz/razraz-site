import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' — сайт работает и на <user>.github.io/<repo>, и на своём домене
export default defineConfig({
  base: './',
  plugins: [react()],
})
