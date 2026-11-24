import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["archive-mark-v3.svg", "archive-mark-v3-touch.png"],
      manifest: {
        name: "종점 없는 서고",
        short_name: "종점 없는 서고",
        description: "끝나지 않는 열차, 각 객차가 하나의 책이다.",
        lang: "ko",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#fffefa",
        theme_color: "#fffefa",
        icons: [
          { src: "archive-mark-v3-192.png", sizes: "192x192", type: "image/png" },
          { src: "archive-mark-v3-512.png", sizes: "512x512", type: "image/png" },
          { src: "archive-mark-v3-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,webp,woff2}"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-styles" },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "pretendard-font",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
});
