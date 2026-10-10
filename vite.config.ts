import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Raise limit for ML and visualization bundles
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Split charting library
          'vendor-recharts': ['recharts'],
          // Split Supabase client
          'vendor-supabase': ['@supabase/supabase-js'],
          // Split icons
          'vendor-icons': ['lucide-react'],
          // Split WebLLM inference engine
          'vendor-webllm': ['@mlc-ai/web-llm'],
          // Split Mermaid visual diagramming engine
          'vendor-mermaid': ['mermaid'],
          // Split OCR and document processing
          'vendor-ocr': ['tesseract.js'],
          'vendor-pdf': ['pdfjs-dist'],
        },
      },
    },
  },
})
