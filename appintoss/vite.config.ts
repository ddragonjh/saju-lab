import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
      '@app': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    sourcemap: false,
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/shared/saju-engine/')) return 'saju';
          if (id.includes('/shared/fortune-engine/') || id.includes('/shared/tarot-data/') || id.includes('/shared/oracle-data/')) return 'readings';
          return undefined;
        },
      },
    },
  },
});
