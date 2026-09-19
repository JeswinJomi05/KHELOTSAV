import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      { find: /(.*)\/L1\.png$/, replacement: '$1/L1.svg' },
      { find: /(.*)\/L2\.png$/, replacement: '$1/L2.svg' },
      { find: /(.*)\/L4\.png$/, replacement: '$1/L4.svg' },
      { find: /(.*)\/musicalnotes\.png$/, replacement: '$1/musicalnotes.svg' },
    ]
  }
})
