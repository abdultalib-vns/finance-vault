import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const port = Number(process.env.PORT) || 3000;
const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,
  define: {
    'import.meta.env.VITE_BUILD_VERSION': JSON.stringify(`Build ${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')} UTC`),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      base: basePath,
      includeAssets: ["favicon.png", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "FinAura",
        short_name: "FinAura",
        description: "Secure personal finance tracker with PIN encryption",
        theme_color: "#2563eb",
        background_color: "#f0f2f5",
        display: "standalone",
        orientation: "portrait",
        start_url: basePath,
        scope: basePath,
        icons: [
          {
            src: basePath + "icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: basePath + "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: basePath + "favicon.png",
            sizes: "180x180",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: null,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: false,
    host: "0.0.0.0",
  },
  preview: {
    port,
    host: "0.0.0.0",
  },
});
