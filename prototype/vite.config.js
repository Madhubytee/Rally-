import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    server: {
      port: Number(env.DEV_PORT) || 5173,
      strictPort: false,
      open: false
    },
    preview: {
      port: Number(env.PREVIEW_PORT) || 4173
    }
  }
})
