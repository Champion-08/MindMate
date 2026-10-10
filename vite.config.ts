import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Raise limit slightly — 912KB gzips to 254KB which is acceptable
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Split charting library (heavy)
          'vendor-recharts': ['recharts'],
          // Split Supabase client
          'vendor-supabase': ['@supabase/supabase-js'],
          // Split icons
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
})
