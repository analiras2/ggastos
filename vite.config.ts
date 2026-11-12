import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

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
  // react-native-web's Animated cancels frames through `global`, which browsers do not have.
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['react-native-web'],
    esbuildOptions: { resolveExtensions: WEB_EXTENSIONS, define: { global: 'globalThis' } },
  },
  build: {
    outDir: 'dist',
  },
  // Unit tests cover pure rules only (no DOM), and live next to the code they test.
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
