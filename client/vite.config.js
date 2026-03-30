import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_PROXY_TARGET = process.env.VITE_API_URL || 'http://localhost:5000';

export default defineConfig({
  plugins: [react()],
  server: {
    port:       5173,
    strictPort: false,   // allow fallback if 5173 is busy
    proxy: {
      '/api': {
        target:              API_PROXY_TARGET,
        changeOrigin:        true,
        cookieDomainRewrite: 'localhost',
        configure: (proxy) => {
          proxy.on('error',    (err)       => console.error('[proxy error]',  err.message));
          proxy.on('proxyReq', (_req, req) => console.log('[proxy →]', req.method, req.url));
        },
      },
    },
  },
  build: { outDir: 'dist' },
});
