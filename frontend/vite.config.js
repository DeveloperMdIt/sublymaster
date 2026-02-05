import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Lädt die .env Dateien (falls vorhanden)
  const env = loadEnv(mode, process.cwd(), '');

  // Definition der Fallback-URL: 
  // Wenn keine VITE_API_URL gesetzt ist, nimm in Produktion die echte Domain, 
  // sonst localhost für die Entwicklung.
  const API_URL = env.VITE_API_URL || (mode === 'production' 
    ? 'https://sublymaster.de' 
    : 'http://localhost:3000'); // Dein lokaler Backend-Port

  return {
    plugins: [react()],
    define: {
      // Hier "backen" wir die URL fest in den Code ein, 
      // falls sie über import.meta.env nicht gefunden wird
      'process.env.VITE_API_URL': JSON.stringify(API_URL)
    },
    server: {
      port: 5174,
      proxy: {
        '/api': {
          target: API_URL,
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
