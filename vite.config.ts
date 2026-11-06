import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const WEB_EXTENSIONS = ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json'];

// The UI is written with React Native primitives and rendered by react-native-web.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'react-native': 'react-native-web',
    },
    extensions: WEB_EXTENSIONS,
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
  optimizeDeps: {
    include: ['react-native-web'],
    esbuildOptions: { resolveExtensions: WEB_EXTENSIONS },
  },
  build: {
    outDir: 'dist',
  },
});
