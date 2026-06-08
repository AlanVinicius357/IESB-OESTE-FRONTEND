import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Garante que o front vai rodar fixo nessa porta
    proxy: {
      // 🔄 Toda vez que o React chamar algo começando com /api, o Vite redireciona para o Docker
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove o '/api' antes de mandar para a sua API Express
      },
    },
  },
})
