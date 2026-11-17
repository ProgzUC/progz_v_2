import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Prefer .jsx so utils like confirmAction resolve to JSX sources, not stale .js stubs.
  resolve: {
    extensions: ['.mjs', '.jsx', '.js', '.ts', '.tsx', '.json'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
    },
  },
})
