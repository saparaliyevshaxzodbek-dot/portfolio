import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The dev server forwards API calls and uploaded files to the ASP.NET Core backend,
// so the browser only ever talks to one origin.
const backend = process.env.API_URL ?? 'http://localhost:5021';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': backend,
      '/uploads': backend,
    },
  },
});
