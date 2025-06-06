import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000,
    allowedHosts: [
      'codebycisse-commerce-client-production.up.railway.app',
      'localhost',
      '.railway.app'
    ]
  }
})