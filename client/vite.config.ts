import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        // target: "http://localhost:5000",
        target: "https://teamhub-y3lj.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api/v1"),
      },
      "/socket.io": {
        // target: "http://localhost:5000",
        target: "https://teamhub-y3lj.onrender.com",
        ws: true,                         // Enable WebSocket proxying
        changeOrigin: true,
      },
    },
  },
})