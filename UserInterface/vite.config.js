import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    proxy: {
      '/api/v1/': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/temp/': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/placeholders/': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }

  }
});

