import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import { readdirSync } from 'node:fs';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const features = readdirSync('src/features', { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const DEEP_IMPORT_MESSAGE =
  "Import from the feature's public API ('@/features/<name>'), not from its internal files.";

// Anyone outside a feature may only use its index.ts.
const featureBoundary = (allowedFeature) => ({
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          group: allowedFeature ? ['@/features/*/*', `!@/features/${allowedFeature}/*`] : ['@/features/*/*'],
          message: DEEP_IMPORT_MESSAGE,
        },
      ],
    },
  ],
});

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'supabase/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat['recommended-latest'],
  {
    files: ['src/**/*.{ts,tsx}', 'vite.config.ts'],
    languageOptions: { globals: { ...globals.browser, ...globals.node, __DEV__: 'readonly' } },
  },
  { files: ['src/**/*.{ts,tsx}'], rules: featureBoundary(null) },
  // Inside a feature, its own files can import each other freely.
  ...features.map((name) => ({ files: [`src/features/${name}/**/*.{ts,tsx}`], rules: featureBoundary(name) })),
  // The shared layer is the base: it never depends on a feature.
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['@/features', '@/features/**'], message: 'shared/ must not depend on features.' }] },
      ],
    },
  }
);
