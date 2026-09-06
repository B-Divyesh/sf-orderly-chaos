import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';

const buildSha = process.env.BUILD_SHA || (() => {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'dev';
  }
})();

export default defineConfig({
  define: {
    __BUILD_SHA__: JSON.stringify(buildSha),
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
