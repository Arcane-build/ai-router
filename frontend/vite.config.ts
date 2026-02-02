import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Backend URL for local development proxy
// In production, this is handled by environment variables
const BACKEND_URL = process.env.VITE_API_URL || 'http://localhost:3001';

console.log('🔧 Vite Config - Backend URL:', BACKEND_URL);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
    },
  },
});
