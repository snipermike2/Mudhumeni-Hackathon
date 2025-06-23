import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // Bolt AI compatibility settings
  server: {
    port: 3000,
    host: true,
    strictPort: false,
  },
  
  // Simplified build for Bolt
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  
  // Optimize for Bolt environment
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
  
  // Handle environment variables
  define: {
    'process.env': {},
  },
});