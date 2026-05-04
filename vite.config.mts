import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const variant = env.VITE_APP_VARIANT || 'employee';

  return {
    plugins: [react()],
    base: `/v2/${variant}/`,
    define: {
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    },
    build: {
      outDir: `dist/${variant}`,
    },
    test: {
      environment: 'jsdom',
      coverage: {
        include: ['src/**'],
        exclude: ['src/main.tsx'],
      },
    },
  };
});
