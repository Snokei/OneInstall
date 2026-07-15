import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: 'dist-electron',
    emptyOutDir: true,
    minify: false,
    ssr: true,
    lib: {
      entry: {
        main: path.resolve(__dirname, 'electron/main.ts'),
        preload: path.resolve(__dirname, 'electron/preload.ts'),
      },
      formats: ['cjs'],
      fileName: (format, entryName) => `${entryName}.cjs`,
    },
    rollupOptions: {
      external: ['electron'],
    },
  },
});
