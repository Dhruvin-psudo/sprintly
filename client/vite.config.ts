import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return;

          if (id.includes('recharts')) {
            return 'vendor-charts';
          }
          if (id.includes('socket.io-client')) {
            return 'vendor-socket';
          }
          if (id.includes('@tanstack') || id.includes('axios')) {
            return 'vendor-query';
          }
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
            return 'vendor-forms';
          }
          if (id.includes('date-fns') || id.includes('react-day-picker')) {
            return 'vendor-date';
          }
          if (id.includes('lucide-react') || id.includes('sonner')) {
            return 'vendor-ui';
          }
          if (
            id.includes('react-router') ||
            id.includes('react-dom') ||
            id.includes('/react/') ||
            id.includes('\\react\\')
          ) {
            return 'vendor-react';
          }
        },
      },
    },
  },
})
