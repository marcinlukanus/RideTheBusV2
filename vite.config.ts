import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import netlify from '@netlify/vite-plugin-tanstack-start';
import tsConfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ['./tsconfig.json'] }),
    tanstackStart({ srcDirectory: 'src' }),
    // Netlify plugin is only needed for production builds.
    // In dev mode it intercepts Vite's internal /@id/ module requests and
    // routes them through the SSR handler, causing a 307 redirect loop that
    // prevents client-side hydration entirely.
    ...(command === 'build' ? [netlify()] : []),
    react(),
  ],
}));
