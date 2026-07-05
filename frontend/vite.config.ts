import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: [
      'devoted-creation-production-e68b.up.railway.app',
    ],
  },
});
