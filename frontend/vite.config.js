import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Lädt die .env Dateien (falls vorhanden)
  const env = loadEnv(mode, process.cwd(), '');

  // Definition der Fallback-URL: 
  // Wenn keine VITE_API_URL gesetzt ist, nimm in Produktion die echte Domain, 
  // sonst localhost für die Entwicklung.
  const API_TARGET = env.VITE_API_URL || 'http://localhost:3001';

  return {
    plugins: [react()],
    server: {
      port: 5174,
      proxy: {
        '/api': {
          target: API_TARGET,
          changeOrigin: true,
        }
      }
    },
    build: {
      // Stellt sicher, dass beim Build alles sauber ersetzt wird
      sourcemap: mode !== 'production'
    }
  };
});
