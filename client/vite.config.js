import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_BASE is set automatically when publishing to GitHub Pages (the site lives at /repo-name/).
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:5000', '/uploads': 'http://localhost:5000' } },
});
