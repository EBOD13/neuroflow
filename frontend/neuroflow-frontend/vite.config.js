import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'classic' // Add this line to fix the preamble error
  })],
  server: {
    host: 'localhost',
    port: 5173
  }
});