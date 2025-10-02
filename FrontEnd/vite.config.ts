import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd(),'')
  return defineConfig({

    plugins: [react(), tailwindcss()],
    base: '/PlantillaQR',
    server: {
      allowedHosts: true
    },
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL)
    }
  })

}
