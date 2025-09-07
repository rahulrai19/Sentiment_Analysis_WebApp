import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true
  },
  build: {
    // Optimize bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@heroicons/react', 'react-hot-toast'],
          charts: ['chart.js', 'react-chartjs-2'],
        },
      },
    },
    // Enable compression
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },
  // Enable compression for dev server
  preview: {
    port: 4173,
  },
})