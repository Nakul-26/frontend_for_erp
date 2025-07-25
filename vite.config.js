import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['jspdf', 'jspdf-autotable'], // ✅ Required for Netlify build
    },
  },
});
